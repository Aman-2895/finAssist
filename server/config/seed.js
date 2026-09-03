// Run once after connecting to a fresh DB: `node config/seed.js`
// Seeds the static, public insurance scheme reference data.
require('dotenv').config()
const mongoose = require('mongoose')
const InsuranceScheme = require('../models/InsuranceScheme')

const schemes = [
  {
    name: 'PMJJBY',
    fullName: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
    coverage: '₹2,00,000 life cover',
    premium: '₹436 / year',
    eligibilityCriteria: 'Age 18-50, bank/post office account, auto-debit consent',
  },
  {
    name: 'PMSBY',
    fullName: 'Pradhan Mantri Suraksha Bima Yojana',
    coverage: '₹2,00,000 accidental cover',
    premium: '₹20 / year',
    eligibilityCriteria: 'Age 18-70, bank/post office account, auto-debit consent',
  },
  {
    name: 'Ayushman Bharat',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    coverage: '₹5,00,000 health cover / family / year',
    premium: 'Free (income-based eligibility)',
    eligibilityCriteria: 'Household listed under SECC 2011 deprivation criteria',
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  await InsuranceScheme.deleteMany({})
  await InsuranceScheme.insertMany(schemes)
  console.log(`Seeded ${schemes.length} insurance schemes`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
