const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listGoals, createGoal, updateGoal, deleteGoal, accelerateGoal } = require('../controllers/goalController')

const router = express.Router()

router.get('/', authRequired, listGoals)
router.post('/', authRequired, createGoal)
router.put('/:id', authRequired, updateGoal)
router.delete('/:id', authRequired, deleteGoal)
router.post('/:id/accelerate', authRequired, accelerateGoal)

module.exports = router
