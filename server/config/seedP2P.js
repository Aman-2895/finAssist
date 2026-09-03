// Run once after connecting to a fresh DB: `node config/seedP2P.js`
// Creates a handful of demo "bot" counterparty users with open lender/borrower
// listings, so the P2P marketplace has someone to negotiate with immediately —
// no second real account needed to demo the feature.
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const LoanListing = require('../models/LoanListing')

const bots = [
  { phone: '+91DEMO0001', name: 'Priya Sharma', trustScore: 780, isVerified: true },
  { phone: '+91DEMO0002', name: 'Arjun Mehta', trustScore: 705, isVerified: true },
  { phone: '+91DEMO0003', name: 'Fatima Sheikh', trustScore: 812, isVerified: true },
  { phone: '+91DEMO0004', name: 'Suresh Nair', trustScore: 690, isVerified: true },
  { phone: '+91DEMO0005', name: 'Kavya Reddy', trustScore: 750, isVerified: true },
]

const listingsByBot = [
  { botPhone: '+91DEMO0001', postType: 'lender', amount: 10000, interestRate: 12, tenureMonths: 6 },
  { botPhone: '+91DEMO0002', postType: 'lender', amount: 5000, interestRate: 10, tenureMonths: 3 },
  { botPhone: '+91DEMO0003', postType: 'lender', amount: 20000, interestRate: 13.5, tenureMonths: 12 },
  { botPhone: '+91DEMO0004', postType: 'borrower', amount: 15000, interestRate: 11, tenureMonths: 6, purpose: 'New auto-rickshaw tyres + service' },
  { botPhone: '+91DEMO0005', postType: 'borrower', amount: 8000, interestRate: 9, tenureMonths: 4, purpose: 'Medical — family emergency' },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)

  const botDocs = {}
  for (const bot of bots) {
    const doc = await User.findOneAndUpdate(
      { phone: bot.phone },
      { ...bot, isDemoBot: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    botDocs[bot.phone] = doc
  }
  console.log(`Seeded ${bots.length} demo P2P counterparty users`)

  await LoanListing.deleteMany({ postedBy: { $in: Object.values(botDocs).map((b) => b._id) } })
  const listings = listingsByBot.map((l) => ({
    postedBy: botDocs[l.botPhone]._id,
    postType: l.postType,
    amount: l.amount,
    interestRate: l.interestRate,
    tenureMonths: l.tenureMonths,
    purpose: l.purpose,
    status: 'Open',
  }))
  await LoanListing.insertMany(listings)
  console.log(`Seeded ${listings.length} demo P2P listings`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
