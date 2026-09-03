const ChatLog = require('../models/ChatLog')
const User = require('../models/User')
const { askGemini } = require('../services/geminiService')

async function sendMessage(req, res, next) {
  try {
    const { message, language } = req.body
    const user = await User.findById(req.userId)

    const response = await askGemini(message, {
      language: language || user?.language || 'en',
      userContext: {
        employmentType: user?.employmentType,
        monthlyIncomeAvg: user?.monthlyIncomeAvg,
        selfReportedCibil: user?.selfReportedCibil,
      },
    })

    await ChatLog.create({ userId: req.userId, message, response, language: language || 'en' })

    res.json({ response })
  } catch (err) { next(err) }
}

async function getHistory(req, res, next) {
  try {
    const logs = await ChatLog.find({ userId: req.userId }).sort({ createdAt: 1 }).limit(100)
    res.json(logs)
  } catch (err) { next(err) }
}

module.exports = { sendMessage, getHistory }
