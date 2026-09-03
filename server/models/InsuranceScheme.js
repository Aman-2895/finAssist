const mongoose = require('mongoose')

// Seeded, static reference data — real public schemes (PMJJBY, PMSBY, etc).
// Informational matching only; no policy issuance (would require IRDAI registration).
const insuranceSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  coverage: { type: String, required: true },
  premium: { type: String, required: true },
  eligibilityCriteria: { type: String },
})

module.exports = mongoose.model('InsuranceScheme', insuranceSchemeSchema)
