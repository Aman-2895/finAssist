const mongoose = require('mongoose')

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    response: { type: String, required: true },
    language: { type: String, default: 'en' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ChatLog', chatLogSchema)
