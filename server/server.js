require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { clerkMiddleware } = require('@clerk/express')

const connectDB = require('./config/db')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const userRoutes = require('./routes/userRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const goalRoutes = require('./routes/goalRoutes')
const creditScoreRoutes = require('./routes/creditScoreRoutes')
const investmentRoutes = require('./routes/investmentRoutes')
const p2pRoutes = require('./routes/p2pRoutes')
const insuranceRoutes = require('./routes/insuranceRoutes')
const simulationRoutes = require('./routes/simulationRoutes')
const plannedExpenseRoutes = require('./routes/plannedExpenseRoutes')
const chatRoutes = require('./routes/chatRoutes')
const statementRoutes = require('./routes/statementRoutes')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())
app.use(morgan('dev'))

// Attaches req.auth from the Clerk session cookie/token on every request —
// required before any route uses the authRequired middleware chain.
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
}))

// Basic rate limiting on the whole API — tighten per-route in production
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'finassist-api' }))

app.use('/api/users', userRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/credit-score', creditScoreRoutes)
app.use('/api/investments', investmentRoutes)
app.use('/api/p2p', p2pRoutes)
app.use('/api/insurance', insuranceRoutes)
app.use('/api/simulations', simulationRoutes)
app.use('/api/planned-expenses', plannedExpenseRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/statements', statementRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`FinAssist API running on port ${PORT}`))
})
