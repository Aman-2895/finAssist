const express = require('express')
const { authRequired } = require('../middleware/auth')
const upload = require('../middleware/upload')
const { uploadStatement } = require('../controllers/statementController')

const router = express.Router()

router.post('/upload', authRequired, upload.single('statement'), uploadStatement)

module.exports = router
