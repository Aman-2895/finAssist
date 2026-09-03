// Clerk handles identity (who is this person, is their session valid).
// This app still keeps its own MongoDB User document per person for
// app-specific data (income, expenses, goals, etc.) that Clerk knows
// nothing about — so every authenticated request resolves the Clerk
// identity to a Mongo user, auto-creating one on first login.
const { requireAuth: clerkRequireAuth, getAuth, clerkClient } = require('@clerk/express')
const User = require('../models/User')

async function resolveUser(req, res, next) {
  try {
    const { userId: clerkId } = getAuth(req)
    if (!clerkId) return res.status(401).json({ message: 'Not authenticated' })

    let user = await User.findOne({ clerkId })

    if (!user) {
      // First time we've seen this Clerk identity — provision a matching
      // FinAssist profile, prefilling name/phone/email from Clerk where available.
      let prefill = {}
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId)
        prefill = {
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined,
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || undefined,
          email: clerkUser.primaryEmailAddress?.emailAddress || undefined,
        }
      } catch {
        // Non-fatal — proceed with a blank profile if Clerk lookup fails
      }
      user = await User.create({ clerkId, ...prefill })
    }

    req.userId = user._id.toString()
    req.clerkId = clerkId
    next()
  } catch (err) { next(err) }
}

// Drop-in replacement for the old JWT-based authRequired — Express flattens
// arrays passed as route middleware, so existing route files that do
// `router.get('/x', authRequired, handler)` need no other changes.
const authRequired = [clerkRequireAuth(), resolveUser]

module.exports = { authRequired }
