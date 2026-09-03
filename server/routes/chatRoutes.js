const express = require('express')
const { authRequired } = require('../middleware/auth')
const { sendMessage, getHistory } = require('../controllers/chatController')

const router = express.Router()

router.post('/message', authRequired, sendMessage)
router.get('/history', authRequired, getHistory)

module.exports = router
