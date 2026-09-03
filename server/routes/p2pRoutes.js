const express = require('express')
const { authRequired } = require('../middleware/auth')
const {
  listListings, myListings, createListing, closeListing,
  openNegotiation, listMyNegotiations, getNegotiation, postMessage, acceptOffer, declineNegotiation,
  myMatches,
} = require('../controllers/p2pController')

const router = express.Router()

// Listings — browse the opposite side, post your own, manage your own
router.get('/listings', authRequired, listListings)
router.get('/listings/mine', authRequired, myListings)
router.post('/listings', authRequired, createListing)
router.post('/listings/:id/close', authRequired, closeListing)

// Negotiation — chat + offer/counter-offer thread per listing+counterparty
router.post('/listings/:listingId/negotiate', authRequired, openNegotiation)
router.get('/negotiations', authRequired, listMyNegotiations)
router.get('/negotiations/:id', authRequired, getNegotiation)
router.post('/negotiations/:id/messages', authRequired, postMessage)
router.post('/negotiations/:id/accept', authRequired, acceptOffer)
router.post('/negotiations/:id/decline', authRequired, declineNegotiation)

// Finalized matches
router.get('/matches', authRequired, myMatches)

module.exports = router
