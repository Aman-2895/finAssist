# FinAssist — AI-Powered Micro-Finance Advisor for Gig & Informal Workers

FinAssist is a full-stack financial planning platform designed for gig workers, freelancers, and informal-sector earners whose income doesn't fit the standard salary-slip model traditional finance tools assume. Using only self-reported income/expense data and in-app activity, it builds an explainable alternative credit score and wraps it in a set of planning tools — savings goals, micro-investing, peer-to-peer lending, insurance matching, and an AI financial literacy chatbot — all tailored to irregular income.

**Focus areas:** financial inclusion, alternative credit scoring, savings discipline for variable income.

---

## Table of Contents

- [Overview](#overview)
- [Design Constraints & Scope](#design-constraints--scope)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

Gig and informal workers typically have irregular income, no fixed salary slip, and little to no formal credit history — which shuts them out of most bank-grade financial tools. FinAssist addresses this by:

- Deriving a **transparent, rule-based credit score** (with an optional ML model for comparison) purely from data the user provides or logs themselves — no bank login or credit bureau access required.
- Providing planning tools purpose-built for **variable income**: an emergency-fund tracker, goal-based savings with a funding-gap solver, an expense simulator, and forward calendar planning.
- Offering **simulated** access to two typically license-gated services — peer-to-peer lending and insurance scheme matching — so users can explore and understand these options even where full regulatory access isn't available in an app of this scope.
- Backing it all with a **Gemini-powered financial literacy chatbot** that answers in the user's own language.

## Design Constraints & Scope

Two aspects of the product are intentionally scoped as simulations rather than live integrations:

1. **Credit bureau data** (CIBIL, Experian, Equifax) is issued only to RBI-licensed banks and NBFCs, so FinAssist computes its own alternative score from self-reported and in-app data instead of pulling a real bureau report.
2. **P2P lending and insurance issuance** would require an NBFC-P2P license and IRDAI registration respectively to move real funds or issue real policies. FinAssist implements the full user experience — matching, negotiation, offer/counter-offer, scheme eligibility — without moving real money or issuing real cover.
3. Uploaded bank statements are **parsed in memory and discarded** — no raw statement file is ever persisted to disk or database.

This keeps the technical pipeline (matching, negotiation, scoring, eligibility logic) fully functional and demonstrable while staying clear of activities that require a financial services license.

---

## Features

| Module | Description |
|---|---|
| **Authentication** | Email, phone-OTP, or social sign-in via Clerk; session management and user menu |
| **Financial Profile** | Self-reported income, expenses, savings, debt, and (optional) existing CIBIL score |
| **Credit Score Engine** | Rule-based 300–900 alternative score with a factor-by-factor breakdown and 6-month trend history |
| **Emergency Fund Saver** | Goal-based emergency buffer tracker with adjustable monthly contribution |
| **Micro-Investment Advisor** | Rule-based, low-risk instrument suggestions sized to monthly surplus |
| **P2P Lending Marketplace** | Post as lender or borrower, browse listings from the other side, negotiate via chat with structured rate offers/counter-offers, accept to lock terms and auto-generate a repayment schedule |
| **Insurance Assistant** | Matches users to real public insurance schemes (PMJJBY, PMSBY, Ayushman Bharat) based on eligibility |
| **Goal Financial Planning** | Set a savings goal and get a monthly contribution breakdown |
| **Goal Accelerator** | When a goal's timeline is tighter than natural saving pace allows, ranks funding options (family, P2P, NBFC) by interest rate and risk, with a recommended hybrid path |
| **Calendar & Forward Planning** | Monthly income/expense/savings overview plus advisory for known upcoming expenses |
| **Expense Simulator** | What-if, category-wise budget builder with an instant report |
| **Financial Literacy Chatbot** | Gemini-powered assistant, multilingual (English/Hindi/Marathi in the current build) |
| **Fraud/Anomaly Detection** | Isolation Forest anomaly-detection endpoint and schema are implemented in the Python microservice; not yet wired into the frontend |

---

## Tech Stack

**Frontend** (`/client`)
- React 18 (Vite) + Tailwind CSS v4
- [Clerk](https://clerk.com) (`@clerk/clerk-react`) for authentication
- React Router v6, Framer Motion, Recharts, Lucide icons
- Light/dark theme via CSS custom properties, system-preference aware

**Backend** (`/server`)
- Node.js + Express 5
- MongoDB Atlas + Mongoose
- Clerk (`@clerk/express`) verifies each request's session token; a matching MongoDB profile document is auto-created on a user's first login
- Multer (in-memory file uploads only — nothing is written to disk), node-cron (available for scheduled jobs)
- Helmet, CORS, and rate limiting on all `/api` routes
- Google Gemini API for the chatbot

**Python microservice** (`/server/python-scoring`)
- Flask + scikit-learn — ML comparison scoring model and Isolation Forest anomaly detection
- pdfplumber for PDF bank-statement parsing
- Runs independently on port `5001`; the Node backend calls it over internal REST

**Database**
- MongoDB Atlas (free M0 tier is sufficient, since only structured JSON documents are stored — never raw files)

---

## Project Structure

```
FinAssist/
├── client/                              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx        # Shell: sidebar + topbar + routed page
│   │   │   │   ├── ProtectedRoute.jsx   # Redirects to /login if unauthenticated
│   │   │   │   ├── Sidebar.jsx          # Left nav across all modules
│   │   │   │   └── Topbar.jsx           # Page title, notifications, user menu, theme toggle
│   │   │   └── ui/
│   │   │       ├── GoalAccelerator.jsx  # Funding-gap solver panel
│   │   │       ├── NegotiationPanel.jsx # P2P chat + offer/counter-offer panel
│   │   │       ├── Primitives.jsx       # Card, StatCard, ProgressBar, Badge, fmtINR
│   │   │       ├── ScoreGauge.jsx       # Animated SVG credit score gauge
│   │   │       └── ThemeToggle.jsx      # Light/dark switch
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # Bridges Clerk identity with FinAssist's profile data
│   │   │   └── ThemeContext.jsx         # Theme state, persisted via a class on <html>
│   │   ├── lib/
│   │   │   ├── api.js                   # Central API client — attaches a Clerk session token to every call
│   │   │   └── goalSolver.js            # Client-side funding-gap algorithm
│   │   ├── pages/
│   │   │   ├── Login.jsx / Signup.jsx   # Clerk auth flows wrapped in FinAssist branding
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FinancialProfile.jsx
│   │   │   ├── CreditScore.jsx
│   │   │   ├── EmergencyFund.jsx
│   │   │   ├── Investments.jsx
│   │   │   ├── P2PLending.jsx
│   │   │   ├── Insurance.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── Simulator.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── App.jsx                      # Route table
│   │   ├── main.jsx                     # Entry point
│   │   └── index.css                    # Design tokens (light + dark theme)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                              # Express backend
│   ├── config/
│   │   ├── db.js                        # MongoDB connection
│   │   ├── seed.js                      # Seeds public insurance scheme reference data
│   │   └── seedP2P.js                   # Seeds demo P2P counterparty users + listings
│   ├── models/                          # Mongoose schemas
│   │   ├── User.js, Expense.js, PlannedExpense.js, Simulation.js
│   │   ├── Goal.js, Investment.js
│   │   ├── LoanListing.js, Negotiation.js, LoanMatch.js
│   │   ├── InsuranceScheme.js, UserInsuranceMatch.js
│   │   ├── CreditScoreHistory.js, FraudAlert.js, ChatLog.js
│   ├── controllers/                     # One per resource, mirrors models
│   ├── routes/                          # One per resource, mounted in server.js
│   ├── middleware/
│   │   ├── auth.js                      # Clerk session verification
│   │   ├── errorHandler.js
│   │   └── upload.js                    # Multer, memory storage only
│   ├── services/
│   │   ├── creditScoring.js             # Rule-based scoring engine
│   │   ├── goalSolver.js                # Server-side mirror of the Goal Accelerator
│   │   ├── p2pBot.js                    # Auto-reply logic for seeded P2P counterparties
│   │   └── geminiService.js             # Gemini API wrapper
│   ├── python-scoring/
│   │   ├── app.py                       # Flask: ML score, fraud scan, PDF parsing
│   │   └── requirements.txt
│   ├── server.js                        # Express app entry point
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- A free [Clerk](https://dashboard.clerk.com) account (handles login/signup)
- Python 3.10+ (optional — only needed for the scoring microservice)
- A [Gemini API key](https://aistudio.google.com/apikey) (optional — needed for live chatbot responses)

### 1. Set up Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Under **API Keys**, copy the **Publishable key** and **Secret key**.
3. Optionally, under **User & Authentication → Email, Phone, Username**, enable **Phone number** for phone-OTP login. Email/password and email-OTP work out of the box.

### 2. Backend

```bash
cd server
npm install
# create a .env file with the variables listed below
npm run seed          # seeds insurance scheme reference data
npm run seed:p2p      # seeds demo P2P counterparty accounts + listings
npm run dev           # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
# create a .env file with the variables listed below
npm run dev           # starts on http://localhost:5173
```

The backend must be running (with MongoDB connected) for the frontend to work — there is no mock-data fallback mode. Every page calls the Express API directly, using a Clerk session token attached automatically by `lib/api.js`.

**Signing in:** use the Sign Up flow on the login screen to create an account through Clerk (email, phone, or whatever method you enabled). Clerk handles delivery of verification codes — no manual setup needed.

**About the P2P demo accounts:** `npm run seed:p2p` creates demo users flagged `isDemoBot: true` with open lender/borrower listings. Negotiating against one of these listings triggers automatic counter-offers and eventual acceptance from `server/services/p2pBot.js`, so the marketplace is fully testable without a second real user. Negotiating with a second real FinAssist account also works, but replies then need to come from that account's own session.

### 4. Python scoring microservice (optional)

```bash
cd server/python-scoring
pip install -r requirements.txt
python app.py          # starts on http://localhost:5001
```

---

## Environment Variables

**`server/.env`**

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `GEMINI_API_KEY` | No | Enables live chatbot responses; without it, the chatbot returns a configuration notice |
| `CLIENT_ORIGIN` | No | CORS origin for the frontend (defaults to `*`) |
| `PORT` | No | API port (defaults to `5000`) |

**`client/.env`**

| Variable | Required | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Same Clerk publishable key as above |
| `VITE_API_URL` | No | Backend base URL (defaults to `http://localhost:5000/api`) |

---

## API Reference

All endpoints below (except `/api/health` and `/api/insurance/schemes`) require an `Authorization: Bearer <clerk-session-token>` header. The frontend attaches this automatically via Clerk's `getToken()`; for manual testing with curl/Postman, grab a token from `window.Clerk.session.getToken()` in the browser console while logged in.

### Core backend (`localhost:5000`)

| Method | Endpoint | Purpose |
|---|---|---|
| GET / PUT | `/api/users/me` | Get/update financial profile — auto-created on first call for a new Clerk identity |
| GET / POST / DELETE | `/api/expenses` | Log and list transactions |
| GET | `/api/expenses/summary/monthly` | Aggregated monthly income/expense/savings |
| GET | `/api/credit-score/me` | Compute current credit score |
| GET | `/api/credit-score/history` | Score history over time |
| GET / POST / PUT / DELETE | `/api/goals` | CRUD for savings goals |
| POST | `/api/goals/:id/accelerate` | Goal Accelerator — funding options for a target timeline |
| GET / POST | `/api/investments` | Log and list micro-investments |
| POST | `/api/investments/suggest` | Rule-based investment amount suggestion |
| GET | `/api/p2p/listings?postType=lender\|borrower` | Browse open listings from the other side |
| GET | `/api/p2p/listings/mine` | Your own posted listings |
| POST | `/api/p2p/listings` | Post a lender or borrower listing |
| POST | `/api/p2p/listings/:id/close` | Close your own listing |
| POST | `/api/p2p/listings/:listingId/negotiate` | Open (or fetch) a negotiation thread on a listing |
| GET | `/api/p2p/negotiations` | All your negotiation threads |
| GET | `/api/p2p/negotiations/:id` | One thread (chat + offer history) |
| POST | `/api/p2p/negotiations/:id/messages` | Send a message or a rate offer/counter-offer |
| POST | `/api/p2p/negotiations/:id/accept` | Accept the latest offer — locks terms, creates the LoanMatch |
| POST | `/api/p2p/negotiations/:id/decline` | Decline and close the thread |
| GET | `/api/p2p/matches` | Your finalized, agreed loan matches |
| GET | `/api/insurance/schemes` | Public scheme reference data |
| GET | `/api/insurance/my-matches` | Eligibility matching for the current user |
| GET / POST | `/api/simulations` | Run and list expense simulator scenarios |
| GET / POST / DELETE | `/api/planned-expenses` | Calendar forward-planning entries |
| GET | `/api/planned-expenses/:id/advisory` | Surplus-based advice for a planned expense |
| POST | `/api/chat/message` | Send a message to the Gemini-powered chatbot |
| GET | `/api/chat/history` | Chat history |
| POST | `/api/statements/upload` | Upload a CSV/PDF statement for parsing |

### Python microservice (`localhost:5001`)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/score/ml` | Logistic regression comparison score |
| POST | `/fraud/scan` | Isolation Forest anomaly detection |
| POST | `/statement/parse` | PDF statement extraction (pdfplumber) |

---

## Deployment

| Component | Suggested platform |
|---|---|
| Frontend | Vercel or Cloudflare Pages |
| Node backend | Render |
| Python microservice | Render (separate service) or Railway |
| Database | MongoDB Atlas (M0 free tier) |

Set the environment variables listed above on each platform, and point `VITE_API_URL` at your deployed backend's URL.

---

## License

This project is provided for educational and demonstration purposes. The peer-to-peer lending and insurance modules are simulations — see [Design Constraints & Scope](#design-constraints--scope) before extending this project toward production or real financial transactions.
