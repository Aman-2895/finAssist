const LoanListing = require('../models/LoanListing')
const Negotiation = require('../models/Negotiation')
const LoanMatch = require('../models/LoanMatch')
const User = require('../models/User')
const { generateBotReply } = require('../services/p2pBot')

// NOTE: This entire module is a simulation. Real fund movement between
// lenders and borrowers requires an RBI-issued NBFC-P2P license — see README.

// ---- Listings ----

async function listListings(req, res, next) {
  try {
    const { postType } = req.query // 'lender' | 'borrower' — browse the opposite side
    const filter = { status: { $in: ['Open', 'Negotiating'] } }
    if (postType) filter.postType = postType
    const listings = await LoanListing.find(filter)
      .populate('postedBy', 'name isDemoBot trustScore')
      .sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) { next(err) }
}

async function myListings(req, res, next) {
  try {
    const listings = await LoanListing.find({ postedBy: req.userId }).sort({ createdAt: -1 })
    res.json(listings)
  } catch (err) { next(err) }
}

async function createListing(req, res, next) {
  try {
    const { postType, amount, interestRate, tenureMonths, purpose } = req.body
    if (!['lender', 'borrower'].includes(postType)) {
      return res.status(400).json({ message: "postType must be 'lender' or 'borrower'" })
    }
    const listing = await LoanListing.create({
      postedBy: req.userId, postType, amount, interestRate, tenureMonths, purpose,
    })
    res.status(201).json(listing)
  } catch (err) { next(err) }
}

async function closeListing(req, res, next) {
  try {
    const listing = await LoanListing.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.userId },
      { status: 'Closed' },
      { new: true }
    )
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    res.json(listing)
  } catch (err) { next(err) }
}

// ---- Negotiation ----

// Opens (or fetches, if already open) a negotiation thread between the
// current user and a listing's poster.
async function openNegotiation(req, res, next) {
  try {
    const listing = await LoanListing.findById(req.params.listingId)
    if (!listing) return res.status(404).json({ message: 'Listing not found' })
    if (String(listing.postedBy) === String(req.userId)) {
      return res.status(400).json({ message: "You can't negotiate on your own listing" })
    }

    let negotiation = await Negotiation.findOne({
      listingId: listing._id,
      counterpartyId: req.userId,
    })

    if (!negotiation) {
      negotiation = await Negotiation.create({
        listingId: listing._id,
        posterId: listing.postedBy,
        counterpartyId: req.userId,
        messages: [
          {
            senderId: req.userId,
            kind: 'offer',
            offerRate: listing.interestRate,
            offerAmount: listing.amount,
            offerTenureMonths: listing.tenureMonths,
            text: `Interested in your listing — starting from the posted terms: ₹${listing.amount} at ${listing.interestRate}% for ${listing.tenureMonths} months.`,
          },
        ],
      })
      listing.status = 'Negotiating'
      await listing.save()
    }

    res.status(201).json(negotiation)
  } catch (err) { next(err) }
}

async function listMyNegotiations(req, res, next) {
  try {
    const negotiations = await Negotiation.find({
      $or: [{ posterId: req.userId }, { counterpartyId: req.userId }],
    })
      .populate('listingId')
      .populate('posterId', 'name isDemoBot')
      .populate('counterpartyId', 'name isDemoBot')
      .sort({ updatedAt: -1 })
    res.json(negotiations)
  } catch (err) { next(err) }
}

async function getNegotiation(req, res, next) {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
      .populate('listingId')
      .populate('posterId', 'name isDemoBot trustScore')
      .populate('counterpartyId', 'name isDemoBot trustScore')
    if (!negotiation) return res.status(404).json({ message: 'Not found' })
    const isParticipant = [String(negotiation.posterId._id), String(negotiation.counterpartyId._id)].includes(String(req.userId))
    if (!isParticipant) return res.status(403).json({ message: 'Not a participant in this negotiation' })
    res.json(negotiation)
  } catch (err) { next(err) }
}

// Shared by both the manual "accept" endpoint and the bot's auto-accept path:
// locks in the agreed terms on the listing/negotiation and creates the LoanMatch
// with a simulated repayment schedule.
async function finalizeMatch(negotiation, listing) {
  listing.status = 'Matched'
  await listing.save()

  const lenderId = listing.postType === 'lender' ? negotiation.posterId : negotiation.counterpartyId
  const borrowerId = listing.postType === 'lender' ? negotiation.counterpartyId : negotiation.posterId

  const monthlyAmount = Math.ceil(
    (negotiation.agreedAmount * (1 + (negotiation.agreedRate / 100) * (negotiation.agreedTenureMonths / 12))) /
      negotiation.agreedTenureMonths
  )
  const repaymentSchedule = Array.from({ length: negotiation.agreedTenureMonths }, (_, i) => {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i + 1)
    return { dueDate, amount: monthlyAmount, paid: false }
  })

  return LoanMatch.create({
    listingId: listing._id,
    negotiationId: negotiation._id,
    lenderId,
    borrowerId,
    amount: negotiation.agreedAmount,
    interestRate: negotiation.agreedRate,
    tenureMonths: negotiation.agreedTenureMonths,
    repaymentSchedule,
  })
}

// Post a chat message, optionally carrying a structured rate offer/counter-offer.
async function postMessage(req, res, next) {
  try {
    const { text, offerRate, offerAmount, offerTenureMonths, kind } = req.body
    const negotiation = await Negotiation.findById(req.params.id)
    if (!negotiation) return res.status(404).json({ message: 'Not found' })
    if (negotiation.status !== 'open') {
      return res.status(400).json({ message: 'This negotiation is already closed' })
    }

    negotiation.messages.push({
      senderId: req.userId,
      text,
      offerRate,
      offerAmount,
      offerTenureMonths,
      kind: kind || (offerRate !== undefined ? 'counter_offer' : 'message'),
    })

    // If the other side of this thread is a seeded demo-bot counterparty,
    // auto-generate their reply so the marketplace works without a second
    // live user in the room. Real human counterparties reply via their own
    // session instead — this only fires for bot-owned listings.
    let match = null
    const poster = await User.findById(negotiation.posterId)
    if (poster?.isDemoBot) {
      const listing = await LoanListing.findById(negotiation.listingId)
      const reply = generateBotReply(negotiation, listing, negotiation.posterId)
      if (reply) {
        negotiation.messages.push(reply)
        if (reply.autoAccept) {
          negotiation.status = 'agreed'
          negotiation.agreedRate = reply.offerRate
          negotiation.agreedAmount = reply.offerAmount
          negotiation.agreedTenureMonths = reply.offerTenureMonths
          match = await finalizeMatch(negotiation, listing)
        }
      }
    }

    await negotiation.save()
    res.status(201).json({ negotiation, match })
  } catch (err) { next(err) }
}

// Accept the latest offer on the thread — locks in terms and creates the LoanMatch.
async function acceptOffer(req, res, next) {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
    if (!negotiation) return res.status(404).json({ message: 'Not found' })

    const lastOffer = [...negotiation.messages].reverse().find((m) => m.offerRate !== undefined)
    if (!lastOffer) return res.status(400).json({ message: 'No offer to accept yet' })

    negotiation.agreedRate = lastOffer.offerRate
    negotiation.agreedAmount = lastOffer.offerAmount
    negotiation.agreedTenureMonths = lastOffer.offerTenureMonths
    negotiation.status = 'agreed'
    negotiation.messages.push({ senderId: req.userId, kind: 'accept', text: 'Offer accepted — terms locked in.' })

    const listing = await LoanListing.findById(negotiation.listingId)
    const match = await finalizeMatch(negotiation, listing)
    await negotiation.save()

    res.status(201).json({ negotiation, match })
  } catch (err) { next(err) }
}

async function declineNegotiation(req, res, next) {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
    if (!negotiation) return res.status(404).json({ message: 'Not found' })
    negotiation.status = 'declined'
    negotiation.messages.push({ senderId: req.userId, kind: 'decline', text: 'Declined this negotiation.' })
    await negotiation.save()

    const listing = await LoanListing.findById(negotiation.listingId)
    if (listing && listing.status === 'Negotiating') {
      listing.status = 'Open'
      await listing.save()
    }

    res.json(negotiation)
  } catch (err) { next(err) }
}

async function myMatches(req, res, next) {
  try {
    const matches = await LoanMatch.find({
      $or: [{ lenderId: req.userId }, { borrowerId: req.userId }],
    })
      .populate('lenderId', 'name')
      .populate('borrowerId', 'name')
      .sort({ createdAt: -1 })
    res.json(matches)
  } catch (err) { next(err) }
}

module.exports = {
  listListings, myListings, createListing, closeListing,
  openNegotiation, listMyNegotiations, getNegotiation, postMessage, acceptOffer, declineNegotiation,
  myMatches,
}
