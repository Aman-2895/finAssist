const mongoose = require('mongoose')

const plannedExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g. 'Oct'
    year: { type: Number, required: true },
    category: { type: String, default: 'Other' },
    status: { type: String, enum: ['planned', 'converted_to_goal', 'completed'], default: 'planned' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PlannedExpense', plannedExpenseSchema)
