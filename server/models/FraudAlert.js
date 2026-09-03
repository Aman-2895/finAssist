const mongoose = require('mongoose')

// Parked module — schema kept ready so it can be re-enabled later
// without a migration (per project scope decision, see README).
const fraudAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
    riskScore: { type: Number, min: 0, max: 100 },
    reason: { type: String },
    flaggedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['open', 'reviewed', 'dismissed'], default: 'open' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('FraudAlert', fraudAlertSchema)
