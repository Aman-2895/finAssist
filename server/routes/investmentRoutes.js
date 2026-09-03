const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listInvestments, createInvestment, suggestInvestment } = require('../controllers/investmentController')

const router = express.Router()

router.get('/', authRequired, listInvestments)
router.post('/', authRequired, createInvestment)
router.post('/suggest', authRequired, suggestInvestment)

module.exports = router
