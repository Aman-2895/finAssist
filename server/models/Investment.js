const mongoose = require('mongoose')

const investmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    instrumentType: { type: String, required: true }, // e.g. 'Micro-SIP', 'Digital Gold'
    amountInvested: { type: Number, required: true },
    frequency: { type: String, enum: ['Weekly', 'Monthly', 'One-time'], default: 'Monthly' },
    simulatedReturns: { type: Number, default: 0 },
    risk: { type: String, enum: ['Very Low', 'Low', 'Moderate'], default: 'Low' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Investment', investmentSchema)
