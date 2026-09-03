const PlannedExpense = require('../models/PlannedExpense')
const Expense = require('../models/Expense')

async function listPlanned(req, res, next) {
  try {
    const items = await PlannedExpense.find({ userId: req.userId }).sort({ year: 1, month: 1 })
    res.json(items)
  } catch (err) { next(err) }
}

async function createPlanned(req, res, next) {
  try {
    const { title, amount, month, year, category } = req.body
    const item = await PlannedExpense.create({ userId: req.userId, title, amount, month, year, category })
    res.status(201).json(item)
  } catch (err) { next(err) }
}

async function deletePlanned(req, res, next) {
  try {
    await PlannedExpense.deleteOne({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// Advisory: compares a planned expense against the user's average monthly surplus.
async function advisory(req, res, next) {
  try {
    const expenses = await Expense.find({ userId: req.userId })
    const byMonth = {}
    expenses.forEach((e) => {
      const key = `${e.date.getFullYear()}-${e.date.getMonth()}`
      if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 }
      if (e.type === 'credit') byMonth[key].income += e.amount
      else byMonth[key].expense += e.amount
    })
    const surpluses = Object.values(byMonth).map((m) => m.income - m.expense)
    const avgSurplus = surpluses.length ? surpluses.reduce((a, b) => a + b, 0) / surpluses.length : 0

    const item = await PlannedExpense.findOne({ _id: req.params.id, userId: req.userId })
    if (!item) return res.status(404).json({ message: 'Not found' })

    const overBudget = item.amount > avgSurplus
    res.json({
      avgSurplus: Math.round(avgSurplus),
      overBudget,
      advice: overBudget
        ? `This is above your average monthly surplus of ₹${Math.round(avgSurplus)}. Consider starting a dedicated save-up a couple of months ahead.`
        : `This fits within your average monthly surplus of ₹${Math.round(avgSurplus)}.`,
    })
  } catch (err) { next(err) }
}

module.exports = { listPlanned, createPlanned, deletePlanned, advisory }
