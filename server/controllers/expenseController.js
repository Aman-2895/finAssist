const Expense = require('../models/Expense')

async function listExpenses(req, res, next) {
  try {
    const { month, year, category } = req.query
    const filter = { userId: req.userId }
    if (category) filter.category = category
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1)
      const end = new Date(Number(year), Number(month), 1)
      filter.date = { $gte: start, $lt: end }
    }
    const expenses = await Expense.find(filter).sort({ date: -1 })
    res.json(expenses)
  } catch (err) { next(err) }
}

async function createExpense(req, res, next) {
  try {
    const { date, amount, category, type, source, note } = req.body
    const expense = await Expense.create({ userId: req.userId, date, amount, category, type, source, note })
    res.status(201).json(expense)
  } catch (err) { next(err) }
}

async function deleteExpense(req, res, next) {
  try {
    await Expense.deleteOne({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// Aggregate monthly income/expense/saving — powers Dashboard + Calendar overview
async function monthlySummary(req, res, next) {
  try {
    const expenses = await Expense.find({ userId: req.userId })
    const byMonth = {}
    expenses.forEach((e) => {
      const key = `${e.date.getFullYear()}-${e.date.getMonth() + 1}`
      if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0 }
      if (e.type === 'credit') byMonth[key].income += e.amount
      else byMonth[key].expense += e.amount
    })
    const summary = Object.entries(byMonth).map(([key, v]) => ({
      month: key,
      income: v.income,
      expense: v.expense,
      saving: v.income - v.expense,
    }))
    res.json(summary)
  } catch (err) { next(err) }
}

module.exports = { listExpenses, createExpense, deleteExpense, monthlySummary }
