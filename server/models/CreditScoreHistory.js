const mongoose = require('mongoose')

const creditScoreHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 300, max: 900 },
    factors: {
      incomeRegularity: Number,
      expenseToIncomeRatio: Number,
      savingsConsistency: Number,
      billPunctuality: Number,
      debtBurden: Number,
    },
    modelVersion: { type: String, default: 'rule-based-v1' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('CreditScoreHistory', creditScoreHistorySchema)
