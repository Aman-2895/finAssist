# FinAssist — AI Micro-Finance Advisor for Gig Workers

**SDG 1 (No Poverty) · SDG 8 (Decent Work and Economic Growth)**

FinAssist helps India's gig and informal workforce build a credit history,
savings discipline, and a financial safety net — without needing a bank
login, a CIBIL account, or a fixed salary slip. Every number is either
entered by the user or logged from their own activity in-app; FinAssist
turns that into a transparent, explainable credit score and a set of
planning tools built around irregular income.

---

## Why it's built this way (read this before your viva)

Two real regulatory walls shaped this project on purpose:

1. **Credit bureau data (CIBIL/Experian/Equifax)** is only issued to
   RBI-licensed banks and NBFCs. No student project gets this access.
2. **Real bank transaction data** requires India's Account Aggregator
   framework (Setu, Finvu, OneMoney) — needs business registration and
   RBI sandbox approval.

So instead of pretending to have that access, FinAssist:

- Builds its **own alternative credit score** from self-reported income/
  expense data and logged transactions — a rule-based, explainable model
  (see `server/services/creditScoring.js`), with an optional ML comparison
  model in the Python microservice for a "rule-based vs ML" report section.
- Simulates **P2P lending** (no real fund movement — an NBFC-P2P license
  would be required) and **insurance** (informational scheme-matching only —
  IRDAI registration would be required to actually issue policies).
- Never stores uploaded bank statement files — they're parsed in-memory
  into structured transaction records and discarded.

State this explicitly in your report: *"designed to respect real regulatory
boundaries while demonstrating the full technical pipeline"* is a genuine
strength, not a limitation, of an academic project like this.

---

## Modules

| Module | What it does |
|---|---|
| Auth (Clerk) | Sign-up/login (email, phone OTP, or social — configurable in Clerk's dashboard), session management, user menu |
| Financial Profile | Self-reported income, expenses, savings, debt, self-reported CIBIL |
| Credit Score | Rule-based 300–900 alternative score, factor breakdown, 6-month trend |
| Emergency Fund Saver | Goal-based buffer tracker with adjustable monthly contribution |
| Micro-Investment Advisor | Simulated low-risk instrument suggestions from monthly surplus |
| P2P Lending | Full marketplace — post as **lender or borrower**, browse the opposite side, open a chat thread, exchange offers/counter-offers on rate, accept to lock in terms and auto-generate a repayment schedule |
| Insurance Assistant | Matches user to real public schemes (PMJJBY, PMSBY, Ayushman Bharat) |
| Goal Financial Planning | Set a goal, get a monthly savings breakdown |
| **Goal Accelerator** | If the desired timeline is tighter than natural saving pace, ranks funding options (family, P2P, NBFC) by interest rate and risk, plus a recommended hybrid path |
| Calendar | Monthly income/expense/saving overview + forward planning for known upcoming expenses, with advisory |
| Expense Simulator | What-if category-wise budget builder with an instant report |
| Financial Literacy Chatbot | Gemini-powered, multi-language (English/Hindi/Marathi in the demo) |
| Fraud Alerts | Parked for now — schema and Python anomaly-detection endpoint are ready, just not wired into the UI |

---

## Tech stack

**Frontend** — `/client`
- React 18 (Vite) + TailwindCSS v4
- Clerk (`@clerk/clerk-react`) for authentication — sign-up/login, session, user menu
- React Router v6, Framer Motion, Recharts, Lucide icons
- Light/dark theme (CSS custom properties, system-preference aware)

**Backend** — `/server`
- Node.js + Express, MongoDB Atlas + Mongoose
- Clerk (`@clerk/express`) verifies each request's session token; a
  matching MongoDB profile document is auto-created on first login
- Multer (in-memory statement upload), node-cron (ready for scheduled
  jobs like weekly goal-progress checks)
- Gemini API integration for the chatbot

**Python microservice** — `/server/python-scoring`
- Flask + scikit-learn (ML comparison scoring model, Isolation Forest
  fraud/anomaly detection) + pdfplumber (PDF statement parsing)
- Runs independently on port 5001; Node calls it over internal REST

**Database** — MongoDB Atlas (M0 free tier — 512MB is comfortably enough
since no raw files are stored, only structured JSON documents)

---

## Project structure

```
FinAssist/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx    # Shell: sidebar + topbar + routed page
│   │   │   │   ├── ProtectedRoute.jsx  # Redirects to /login if not authenticated
│   │   │   │   ├── Sidebar.jsx      # Left nav — all modules, FinAssist branding
│   │   │   │   └── Topbar.jsx       # Page title, notifications, user menu, theme toggle
│   │   │   └── ui/
│   │   │       ├── GoalAccelerator.jsx  # Funding-gap solver panel
│   │   │       ├── NegotiationPanel.jsx # P2P chat + offer/counter-offer slide-over
│   │   │       ├── Primitives.jsx       # Card, StatCard, ProgressBar, Badge, fmtINR
│   │   │       ├── ScoreGauge.jsx       # Animated SVG credit score gauge
│   │   │       └── ThemeToggle.jsx      # Light/dark switch
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Bridges Clerk identity with FinAssist's own profile data
│   │   │   └── ThemeContext.jsx     # Theme state, persists via class on <html>
│   │   ├── lib/
│   │   │   ├── api.js               # Central API client — attaches a fresh Clerk session token to every call
│   │   │   └── goalSolver.js        # Client-side funding-gap algorithm (Goal Accelerator)
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Clerk <SignIn> wrapped in FinAssist branding
│   │   │   ├── Signup.jsx           # Clerk <SignUp> wrapped in FinAssist branding
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
│   │   ├── App.jsx                  # Route table
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Design tokens (light + dark theme)
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── server/                           # Express backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── seed.js                  # Seeds public insurance scheme data
│   │   └── seedP2P.js               # Seeds 5 demo P2P counterparty users + listings
│   ├── models/                       # 13 Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── PlannedExpense.js
│   │   ├── Simulation.js
│   │   ├── Goal.js
│   │   ├── Investment.js
│   │   ├── LoanListing.js
│   │   ├── Negotiation.js           # Chat + structured offer thread
│   │   ├── LoanMatch.js
│   │   ├── InsuranceScheme.js
│   │   ├── UserInsuranceMatch.js
│   │   ├── CreditScoreHistory.js
│   │   ├── FraudAlert.js            # Parked module, schema ready
│   │   └── ChatLog.js
│   ├── controllers/                  # One per resource, mirrors models
│   ├── routes/                       # One per resource, mounted in server.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── errorHandler.js
│   │   └── upload.js                # Multer, memory storage only
│   ├── services/
│   │   ├── creditScoring.js         # Rule-based scoring engine
│   │   ├── goalSolver.js            # Server-side mirror of the Goal Accelerator
│   │   ├── p2pBot.js                # Auto-reply logic for seeded P2P counterparties
│   │   └── geminiService.js         # Gemini API wrapper
│   ├── python-scoring/
│   │   ├── app.py                   # Flask: ML score, fraud scan, PDF parse
│   │   └── requirements.txt
│   ├── server.js                     # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── README.md                         # This file
```

---

## Getting started

### 1. Prerequisites
- Node.js 18+
- A free MongoDB Atlas cluster ([atlas.mongodb.com](https://www.mongodb.com/cloud/atlas/register))
- A free Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com)) — handles login/signup
- (Optional) Python 3.10+ for the scoring microservice
- (Optional) A Gemini API key for live chatbot responses ([aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### 2. Set up Clerk (auth)
1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Go to **API Keys** in the sidebar and copy the **Publishable key** and **Secret key**.
3. (Optional) Go to **User & Authentication → Email, Phone, Username** and enable **Phone number** if you want phone-OTP login; email/password or email-OTP work out of the box with no extra config.

### 3. Backend
```bash
cd server
npm install
cp .env.example .env      # fill in MONGODB_URI, CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY, GEMINI_API_KEY
npm run seed                # seeds insurance scheme reference data
npm run seed:p2p            # seeds 5 demo P2P counterparty accounts + listings
npm run dev                  # starts on http://localhost:5000
```

### 4. Frontend
```bash
cd client
npm install
cp .env.example .env       # set VITE_CLERK_PUBLISHABLE_KEY (same publishable key as above) and VITE_API_URL
npm run dev                 # starts on http://localhost:5173
```

The frontend is fully wired to the backend — every page (Dashboard, Credit
Score, Goals, P2P Lending, etc.) calls the Express API directly. Clerk
handles login/session state on the frontend; the backend verifies each
request's Clerk session token (`server/middleware/auth.js`) and
auto-provisions a matching MongoDB profile document on first login. The
backend **must be running** (and MongoDB connected) for the app to work;
there's no mock-data fallback mode.

**Log in:** click Sign up on the login screen and create an account
through Clerk's own flow (email, phone, or whatever you enabled in step 2).
No manual OTP-console-checking needed — Clerk handles delivery for real.

**About the P2P demo accounts:** `npm run seed:p2p` creates 5 users flagged
`isDemoBot: true` with open lender/borrower listings. When you negotiate
against one of these listings, the backend (`server/services/p2pBot.js`)
automatically generates their counter-offers and eventually accepts —
so the marketplace works without needing a second real logged-in user.
Negotiating with a real second FinAssist account works too, but replies
then have to come from that account's own session (no bot auto-reply).

### 5. Python scoring microservice (optional)
```bash
cd server/python-scoring
pip install -r requirements.txt
python app.py                # starts on http://localhost:5001
```

---

## API reference (backend)

All endpoints below (except `/api/health` and `/api/insurance/schemes`)
require an `Authorization: Bearer <clerk-session-token>` header. The
frontend's `lib/api.js` attaches this automatically via Clerk's
`getToken()`; if you're testing with curl/Postman, grab a token from
your browser's dev tools (Application → Cookies, or Clerk's own
`window.Clerk.session.getToken()` in the console while logged in).

| Method | Endpoint | Purpose |
|---|---|---|
| GET/PUT | `/api/users/me` | Get/update financial profile — auto-creates the profile on first call for a new Clerk identity |
| GET/POST/DELETE | `/api/expenses` | Log and list transactions |
| GET | `/api/expenses/summary/monthly` | Aggregated monthly income/expense/saving |
| GET | `/api/credit-score/me` | Compute current credit score |
| GET | `/api/credit-score/history` | Score history over time |
| GET/POST/PUT/DELETE | `/api/goals` | CRUD for savings goals |
| POST | `/api/goals/:id/accelerate` | Goal Accelerator — funding options for a desired timeline |
| GET/POST | `/api/investments` | Log and list micro-investments |
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
| GET | `/api/insurance/my-matches` | Eligibility matching for current user |
| GET/POST | `/api/simulations` | Run and list expense simulator scenarios |
| GET/POST/DELETE | `/api/planned-expenses` | Calendar forward-planning entries |
| GET | `/api/planned-expenses/:id/advisory` | Surplus-based advice for a planned expense |
| POST | `/api/chat/message` | Send a message to the Gemini-powered chatbot |
| GET | `/api/chat/history` | Chat history |
| POST | `/api/statements/upload` | Upload a CSV/PDF statement for parsing |

Python microservice (`localhost:5001`):

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/score/ml` | Logistic regression comparison score |
| POST | `/fraud/scan` | Isolation Forest anomaly detection |
| POST | `/statement/parse` | PDF statement extraction (pdfplumber) |

---

## Deployment notes

- **Frontend** → Vercel or Cloudflare Pages
- **Node backend** → Render
- **Python microservice** → Render (separate service) or Railway
- **MongoDB** → Atlas (M0 free tier is sufficient — see note above)

## License / academic use

Built as an MCA-level academic project. Regulatory-sensitive modules (P2P
lending, insurance) are explicitly simulated — see the "Why it's built this
way" section above before presenting or extending this toward production use.
