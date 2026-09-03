const mongoose = require('mongoose')

const userInsuranceMatchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'InsuranceScheme', required: true },
    eligible: { type: Boolean, default: false },
    reason: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model('UserInsuranceMatch', userInsuranceMatchSchema)
