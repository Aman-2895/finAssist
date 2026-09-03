const User = require('../models/User')

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = [
      'name', 'employmentType', 'monthlyIncomeAvg', 'monthlyExpenseAvg',
      'monthlySavingAvg', 'existingDebt', 'selfReportedCibil', 'dependents', 'language',
    ]
    const updates = {}
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    })

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    next(err)
  }
}

module.exports = { getProfile, updateProfile }
