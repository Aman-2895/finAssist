const mongoose = require('mongoose')

const simulationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    income: { type: Number, required: true },
    categories: [
      {
        name: String,
        amount: Number,
      },
    ],
    totalExpense: { type: Number, required: true },
    remainingBalance: { type: Number, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Simulation', simulationSchema)
