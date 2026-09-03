const Investment = require('../models/Investment')

async function listInvestments(req, res, next) {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(investments)
  } catch (err) { next(err) }
}

async function createInvestment(req, res, next) {
  try {
    const { instrumentType, amountInvested, frequency, risk } = req.body
    const investment = await Investment.create({
      userId: req.userId, instrumentType, amountInvested, frequency, risk,
    })
    res.status(201).json(investment)
  } catch (err) { next(err) }
}

// Simple rule-based suggestion: cap at 15% of monthly surplus, favour low risk.
async function suggestInvestment(req, res, next) {
  try {
    const { monthlyIncome, monthlyExpense } = req.body
    const surplus = Math.max(0, (monthlyIncome || 0) - (monthlyExpense || 0))
    const suggestedAmount = Math.round(surplus * 0.15)
    res.json({
      surplus,
      suggestedAmount,
      suggestion:
        suggestedAmount < 300
          ? { instrumentType: 'Digital Gold (micro)', frequency: 'Monthly', risk: 'Very Low' }
          : { instrumentType: 'Recurring Micro-SIP', frequency: 'Weekly', risk: 'Low' },
    })
  } catch (err) { next(err) }
}

module.exports = { listInvestments, createInvestment, suggestInvestment }
