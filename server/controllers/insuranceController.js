const InsuranceScheme = require('../models/InsuranceScheme')
const UserInsuranceMatch = require('../models/UserInsuranceMatch')
const User = require('../models/User')

async function listSchemes(req, res, next) {
  try {
    const schemes = await InsuranceScheme.find()
    res.json(schemes)
  } catch (err) { next(err) }
}

// Very simple eligibility rule engine against public scheme criteria.
// Real implementations would encode each scheme's actual government rules.
async function matchEligibility(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    const schemes = await InsuranceScheme.find()

    const matches = await Promise.all(
      schemes.map(async (scheme) => {
        let eligible = true
        let reason = 'Meets basic age/income criteria for this scheme.'

        if (scheme.name === 'Ayushman Bharat' && user.monthlyIncomeAvg > 15000) {
          eligible = false
          reason = 'Household income above the scheme threshold for automatic eligibility.'
        }

        const match = await UserInsuranceMatch.findOneAndUpdate(
          { userId: req.userId, schemeId: scheme._id },
          { eligible, reason },
          { upsert: true, new: true }
        )
        return { scheme, eligible, reason, matchId: match._id }
      })
    )

    res.json(matches)
  } catch (err) { next(err) }
}

module.exports = { listSchemes, matchEligibility }
