const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Rent', 'Groceries', 'Transport', 'EMI', 'Phone', 'Medical', 'Entertainment', 'Income', 'Other'],
      default: 'Other',
    },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    source: { type: String, enum: ['manual', 'voice', 'statement'], default: 'manual' },
    note: { type: String, trim: true },
  },
  { timestamps: true }
)

expenseSchema.index({ userId: 1, date: -1 })

module.exports = mongoose.model('Expense', expenseSchema)
