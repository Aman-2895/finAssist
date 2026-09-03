const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listExpenses, createExpense, deleteExpense, monthlySummary } = require('../controllers/expenseController')

const router = express.Router()

router.get('/', authRequired, listExpenses)
router.post('/', authRequired, createExpense)
router.delete('/:id', authRequired, deleteExpense)
router.get('/summary/monthly', authRequired, monthlySummary)

module.exports = router
