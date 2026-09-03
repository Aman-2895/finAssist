// Rule-based alternative credit scoring engine — the "star" module.
// Scales a weighted 0-100 composite onto a 300-900 band to feel CIBIL-like.
// Kept intentionally explainable (no black-box ML) so it's easy to defend
// in a viva; see python-scoring/ for an optional ML comparison model.

const WEIGHTS = {
  incomeRegularity: 0.25,
  expenseToIncomeRatio: 0.2,
  savingsConsistency: 0.25,
  billPunctuality: 0.15,
  debtBurden: 0.15,
}

function scoreIncomeRegularity(monthlyIncomes) {
  if (!monthlyIncomes.length) return 50
  const mean = monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length
  const variance = monthlyIncomes.reduce((a, b) => a + (b - mean) ** 2, 0) / monthlyIncomes.length
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1 // coefficient of variation
  return Math.max(0, Math.min(100, Math.round(100 - cv * 100)))
}

function scoreExpenseRatio(income, expense) {
  if (income <= 0) return 0
  const ratio = expense / income
  return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)))
}

function scoreSavingsConsistency(monthlySavings) {
  if (!monthlySavings.length) return 0
  const positiveMonths = monthlySavings.filter((s) => s > 0).length
  return Math.round((positiveMonths / monthlySavings.length) * 100)
}

function scoreBillPunctuality(onTimeCount, totalBills) {
  if (totalBills === 0) return 70 // neutral default, not enough data
  return Math.round((onTimeCount / totalBills) * 100)
}

function scoreDebtBurden(existingDebt, monthlyIncome) {
  if (monthlyIncome <= 0) return 0
  const ratio = existingDebt / (monthlyIncome * 12)
  return Math.max(0, Math.min(100, Math.round((1 - ratio) * 100)))
}

/**
 * @param {Object} input
 * @param {number[]} input.monthlyIncomes - last N months' income
 * @param {number[]} input.monthlyExpenses - last N months' expense
 * @param {number[]} input.monthlySavings - last N months' saving (income-expense)
 * @param {number} input.onTimeBillCount
 * @param {number} input.totalBillCount
 * @param {number} input.existingDebt
 */
function computeCreditScore(input) {
  const {
    monthlyIncomes = [],
    monthlyExpenses = [],
    monthlySavings = [],
    onTimeBillCount = 0,
    totalBillCount = 0,
    existingDebt = 0,
  } = input

  const avgIncome = monthlyIncomes.length ? monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length : 0
  const avgExpense = monthlyExpenses.length ? monthlyExpenses.reduce((a, b) => a + b, 0) / monthlyExpenses.length : 0

  const factors = {
    incomeRegularity: scoreIncomeRegularity(monthlyIncomes),
    expenseToIncomeRatio: scoreExpenseRatio(avgIncome, avgExpense),
    savingsConsistency: scoreSavingsConsistency(monthlySavings),
    billPunctuality: scoreBillPunctuality(onTimeBillCount, totalBillCount),
    debtBurden: scoreDebtBurden(existingDebt, avgIncome),
  }

  const composite = Object.entries(WEIGHTS).reduce(
    (sum, [key, weight]) => sum + factors[key] * weight,
    0
  ) // 0-100

  const score = Math.round(300 + (composite / 100) * 600) // scale to 300-900

  return { score, factors, composite: Math.round(composite) }
}

module.exports = { computeCreditScore, WEIGHTS }
