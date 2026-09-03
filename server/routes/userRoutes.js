const express = require('express')
const { authRequired } = require('../middleware/auth')
const { getProfile, updateProfile } = require('../controllers/userController')

const router = express.Router()

router.get('/me', authRequired, getProfile)
router.put('/me', authRequired, updateProfile)

module.exports = router
