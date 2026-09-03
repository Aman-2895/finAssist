const mongoose = require('mongoose')

// Simulated P2P listing — no real fund movement. See README for the
// regulatory note on why this stays a simulation (NBFC-P2P license required).
//
// A listing can be posted by either side of the marketplace:
//   postType 'lender'   → "I have ₹X to lend at Y% for Z months"
//   postType 'borrower' → "I need ₹X, willing to pay up to Y% for Z months"
// The opposite side browses and opens a negotiation thread to agree terms.
const loanListingSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postType: { type: String, enum: ['lender', 'borrower'], required: true },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // desired/offered rate at posting time
    tenureMonths: { type: Number, required: true },
    purpose: { type: String, trim: true }, // e.g. "New delivery bike", "Medical emergency"
    status: { type: String, enum: ['Open', 'Negotiating', 'Matched', 'Closed'], default: 'Open' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('LoanListing', loanListingSchema)
