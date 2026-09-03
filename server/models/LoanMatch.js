const mongoose = require('mongoose')

// Created once a Negotiation reaches 'agreed' — the final, locked-in terms
// and simulated repayment schedule.
const loanMatchSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanListing', required: true },
    negotiationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Negotiation' },
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    repaymentSchedule: [
      {
        dueDate: Date,
        amount: Number,
        paid: { type: Boolean, default: false },
      },
    ],
    status: { type: String, enum: ['pending', 'active', 'completed', 'defaulted'], default: 'active' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('LoanMatch', loanMatchSchema)
