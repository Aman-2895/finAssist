const Simulation = require('../models/Simulation')

async function listSimulations(req, res, next) {
  try {
    const sims = await Simulation.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20)
    res.json(sims)
  } catch (err) { next(err) }
}

async function runSimulation(req, res, next) {
  try {
    const { income, categories } = req.body // categories: [{name, amount}]
    const totalExpense = (categories || []).reduce((sum, c) => sum + Number(c.amount || 0), 0)
    const remainingBalance = income - totalExpense

    const sim = await Simulation.create({ userId: req.userId, income, categories, totalExpense, remainingBalance })

    const emiAmount = (categories || []).find((c) => c.name === 'EMI')?.amount || 0
    const emiRatio = income > 0 ? (emiAmount / income) * 100 : 0
    const savingsRatio = income > 0 ? (remainingBalance / income) * 100 : 0

    let verdict
    if (emiRatio > 35) verdict = `EMI is ${emiRatio.toFixed(0)}% of income — above the recommended 30-35% ceiling.`
    else if (savingsRatio < 10) verdict = `Only ${savingsRatio.toFixed(0)}% of income remains as saving in this scenario — consider trimming discretionary categories.`
    else verdict = `Healthy scenario — ${savingsRatio.toFixed(0)}% of income remains after expenses.`

    res.status(201).json({ ...sim.toObject(), verdict })
  } catch (err) { next(err) }
}

module.exports = { listSimulations, runSimulation }
