"""
FinAssist Python scoring microservice (Flask).

Runs alongside the Node/Express API. Handles the parts of the pipeline
Python's data ecosystem is genuinely better at than Node:
  - PDF bank-statement parsing (pdfplumber)
  - The optional ML comparison model for credit scoring (scikit-learn)
  - Fraud/anomaly detection on transaction patterns (Isolation Forest)

The Node API calls this service over internal REST — see server/services/
for the axios client that would call these endpoints in a full deployment.

Run locally:
    pip install -r requirements.txt
    python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import IsolationForest
import numpy as np

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "finassist-scoring"})


@app.route("/score/ml", methods=["POST"])
def score_ml():
    """
    Rule-based vs ML-based comparison, as suggested in the project brief.
    Expects: { "transactions": [{income, expense, saving, onTimeBill}, ...],
               "label_history": [0/1, ...] }  # 1 = historically "good" month
    Trains a tiny logistic regression on the user's own synthetic history
    for demo purposes — in a real deployment this would train on a much
    larger synthetic gig-worker dataset, not just one user's data.
    """
    body = request.get_json(force=True)
    transactions = body.get("transactions", [])
    labels = body.get("label_history", [])

    if len(transactions) < 4 or len(transactions) != len(labels):
        return jsonify({
            "message": "Need at least 4 months of transactions with matching labels to train a comparison model.",
        }), 400

    df = pd.DataFrame(transactions)
    X = df[["income", "expense", "saving"]].fillna(0)
    y = np.array(labels)

    model = LogisticRegression()
    model.fit(X, y)

    latest = X.iloc[[-1]]
    proba = float(model.predict_proba(latest)[0][1])
    ml_score = round(300 + proba * 600)

    return jsonify({
        "ml_score": ml_score,
        "probability_good_standing": round(proba, 3),
        "model": "LogisticRegression (scikit-learn)",
        "note": "Comparison model trained on this user's own history — illustrative for the rule-based vs ML report section.",
    })


@app.route("/fraud/scan", methods=["POST"])
def fraud_scan():
    """
    Isolation Forest anomaly detection over recent transaction amounts.
    Expects: { "amounts": [number, ...] }
    Returns per-transaction anomaly flags. Parked module (see README) —
    wired here so it can be re-enabled without backend changes later.
    """
    body = request.get_json(force=True)
    amounts = body.get("amounts", [])

    if len(amounts) < 10:
        return jsonify({"message": "Need at least 10 transactions for a meaningful scan."}), 400

    X = np.array(amounts).reshape(-1, 1)
    clf = IsolationForest(contamination=0.1, random_state=42)
    preds = clf.fit_predict(X)  # -1 = anomaly, 1 = normal

    flags = [{"amount": a, "anomalous": bool(p == -1)} for a, p in zip(amounts, preds)]
    return jsonify({"results": flags})


@app.route("/statement/parse", methods=["POST"])
def parse_statement():
    """
    Accepts a PDF bank statement (multipart/form-data, field name "file"),
    extracts transaction lines with pdfplumber. Kept minimal here — real
    statement layouts vary a lot bank-to-bank, so this is a demo baseline
    to extend with regex/column-position rules per bank template.
    """
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    import pdfplumber

    file = request.files["file"]
    transactions = []

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if not table:
                continue
            for row in table[1:]:
                if row and len(row) >= 3:
                    transactions.append({"date": row[0], "description": row[1], "amount": row[-1]})

    return jsonify({"transactions": transactions, "count": len(transactions)})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
