const express = require('express')
const { authRequired } = require('../middleware/auth')
const { listSimulations, runSimulation } = require('../controllers/simulationController')

const router = express.Router()

router.get('/', authRequired, listSimulations)
router.post('/', authRequired, runSimulation)

module.exports = router
