const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listSchemes, matchEligibility } = require('../controllers/insuranceController')

const router = express.Router()

router.get('/schemes', listSchemes) // public reference data, no auth needed
router.get('/my-matches', authRequired, matchEligibility)

module.exports = router
