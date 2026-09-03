const mongoose = require('mongoose')

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalName: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true },
    targetDate: { type: Date },
    currentSaved: { type: Number, default: 0 },
    monthlyPlan: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Goal', goalSchema)
