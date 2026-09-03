const Expense = require('../models/Expense')
const User = require('../models/User')
const CreditScoreHistory = require('../models/CreditScoreHistory')
const { computeCreditScore } = require('../services/creditScoring')

// Groups this user's expenses into per-month income/expense totals for the
// last `months` calendar months, oldest first.
async function buildMonthlySeries(userId, months = 6) {
  const since = new Date()
  since.setMonth(since.getMonth() - months)
  const expenses = await Expense.find({ userId, date: { $gte: since } })

  const buckets = {}
  expenses.forEach((e) => {
    const key = `${e.date.getFullYear()}-${e.date.getMonth()}`
    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 }
    if (e.type === 'credit') buckets[key].income += e.amount
    else buckets[key].expense += e.amount
  })

  const ordered = Object.keys(buckets).sort()
  return {
    monthlyIncomes: ordered.map((k) => buckets[k].income),
    monthlyExpenses: ordered.map((k) => buckets[k].expense),
    monthlySavings: ordered.map((k) => buckets[k].income - buckets[k].expense),
  }
}

async function getMyScore(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const series = await buildMonthlySeries(req.userId)

    // Fall back to the self-reported profile if there isn't enough
    // logged transaction history yet — keeps the feature usable on day one.
    const hasHistory = series.monthlyIncomes.length >= 2
    const input = hasHistory
      ? {
          ...series,
          onTimeBillCount: 8, // placeholder until bill-tracking is logged
          totalBillCount: 10,
          existingDebt: user.existingDebt,
        }
      : {
          monthlyIncomes: [user.monthlyIncomeAvg],
          monthlyExpenses: [user.monthlyExpenseAvg],
          monthlySavings: [user.monthlyIncomeAvg - user.monthlyExpenseAvg],
          onTimeBillCount: 7,
          totalBillCount: 10,
          existingDebt: user.existingDebt,
        }

    const result = computeCreditScore(input)

    await CreditScoreHistory.create({
      userId: req.userId,
      score: result.score,
      factors: result.factors,
    })

    res.json(result)
  } catch (err) { next(err) }
}

async function getScoreHistory(req, res, next) {
  try {
    const history = await CreditScoreHistory.find({ userId: req.userId }).sort({ createdAt: 1 })
    res.json(history)
  } catch (err) { next(err) }
}

module.exports = { getMyScore, getScoreHistory }
