const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listPlanned, createPlanned, deletePlanned, advisory } = require('../controllers/plannedExpenseController')

const router = express.Router()

router.get('/', authRequired, listPlanned)
router.post('/', authRequired, createPlanned)
router.delete('/:id', authRequired, deletePlanned)
router.get('/:id/advisory', authRequired, advisory)

module.exports = router
