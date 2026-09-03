const Goal = require('../models/Goal')
const User = require('../models/User')
const { analyzeGoal } = require('../services/goalSolver')

async function listGoals(req, res, next) {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (err) { next(err) }
}

async function createGoal(req, res, next) {
  try {
    const { goalName, targetAmount, targetDate } = req.body
    const goal = await Goal.create({ userId: req.userId, goalName, targetAmount, targetDate })
    res.status(201).json(goal)
  } catch (err) { next(err) }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!goal) return res.status(404).json({ message: 'Goal not found' })
    res.json(goal)
  } catch (err) { next(err) }
}

async function deleteGoal(req, res, next) {
  try {
    await Goal.deleteOne({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { next(err) }
}

// The "Goal Accelerator" — given a desired timeline, returns ranked
// funding options to close the gap between natural saving pace and that deadline.
async function accelerateGoal(req, res, next) {
  try {
    const { desiredMonths } = req.body
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId })
    if (!goal) return res.status(404).json({ message: 'Goal not found' })

    const user = await User.findById(req.userId)
    const monthlyCapacity = user?.monthlySavingAvg || 0

    const analysis = analyzeGoal({
      target: goal.targetAmount,
      current: goal.currentSaved,
      monthlyCapacity,
      desiredMonths: Number(desiredMonths) || 1,
    })

    res.json(analysis)
  } catch (err) { next(err) }
}

module.exports = { listGoals, createGoal, updateGoal, deleteGoal, accelerateGoal }
