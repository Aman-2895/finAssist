const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    // Identity lives in Clerk — this is the link back to it. Everything
    // else below is FinAssist-specific data Clerk has no concept of.
    clerkId: { type: String, required: true, unique: true, index: true },

    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },

    employmentType: {
      type: String,
      enum: [
        'Gig worker — delivery partner',
        'Gig worker — ride-hailing driver',
        'Domestic / home-based worker',
        'Street vendor / small trader',
        'Freelancer',
        'Other informal work',
      ],
      default: 'Other informal work',
    },

    // Self-reported financial profile — no bank/CIBIL API involved
    monthlyIncomeAvg: { type: Number, default: 0 },
    monthlyExpenseAvg: { type: Number, default: 0 },
    monthlySavingAvg: { type: Number, default: 0 },
    existingDebt: { type: Number, default: 0 },
    selfReportedCibil: { type: Number, min: 300, max: 900 },
    dependents: { type: Number, default: 0 },

    language: { type: String, default: 'en' },

    // Seeded counterparty accounts for the P2P demo (see config/seedP2P.js) —
    // lets the marketplace have someone to negotiate with out of the box.
    isDemoBot: { type: Boolean, default: false },
    trustScore: { type: Number, default: 700 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
