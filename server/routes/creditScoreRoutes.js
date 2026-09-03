const express = require('express')
const { authRequired } = require('../middleware/auth')
const { getMyScore, getScoreHistory } = require('../controllers/creditScoreController')

const router = express.Router()

router.get('/me', authRequired, getMyScore)
router.get('/history', authRequired, getScoreHistory)

module.exports = router
