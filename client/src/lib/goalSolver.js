// goalSolver.js
// Core "Goal Accelerator" logic — the piece your admin asked for.
//
// Given a goal (target amount, current saved, monthly saving capacity) and a
// desired timeline, this figures out:
//   1) Whether pure saving gets there in time ("natural pace")
//   2) If not, how big the shortfall is
//   3) A ranked set of funding options to close that shortfall, each with an
//      explicit interest-rate vs risk-level tradeoff, so the user (and your
//      viva panel) can see the reasoning, not just a black-box answer.
//
// Interest is calculated as simple interest over the loan tenure — appropriate
// for short (3–12 month) micro-loans and easy to defend/explain in a viva,
// vs. presenting a compounding formula that's harder to audit by eye.

export const FUNDING_SOURCES = [
  {
    id: 'family',
    label: 'Family / community lending circle',
    type: 'Informal',
    rate: 0,
    risk: 'Social risk',
    riskLevel: 1, // 1 = lowest financial risk, higher = riskier
    description:
      'No or token interest, fastest to arrange. Risk isn\'t financial — it\'s relational: repayment delays can strain the relationship.',
  },
  {
    id: 'p2p_vetted',
    label: 'P2P — vetted lender match',
    type: 'Simulated marketplace',
    rate: 10,
    risk: 'Medium — slower match',
    riskLevel: 2,
    description:
      'Lower rate because the match takes longer to vet. Good when your timeline has a little slack.',
  },
  {
    id: 'p2p_fast',
    label: 'P2P — fast match',
    type: 'Simulated marketplace',
    rate: 13.5,
    risk: 'Medium — higher rate for speed',
    riskLevel: 3,
    description:
      'Matched quickly against open listings, but lenders price in the shorter vetting time with a higher rate.',
  },
  {
    id: 'nbfc',
    label: 'NBFC micro-loan (regulated)',
    type: 'Formal / regulated',
    rate: 18,
    risk: 'Low institutional risk, higher cost',
    riskLevel: 2,
    description:
      'Backed by RBI-regulated processes so the arrangement itself is safer, but the rate is highest of the four — you\'re paying for that structure.',
  },
]

/**
 * @param {Object} params
 * @param {number} params.target - goal target amount (₹)
 * @param {number} params.current - amount already saved (₹)
 * @param {number} params.monthlyCapacity - realistic monthly saving capacity (₹)
 * @param {number} params.desiredMonths - how soon the user wants the goal (months)
 */
export function analyzeGoal({ target, current, monthlyCapacity, desiredMonths }) {
  const remaining = Math.max(0, target - current)
  const naturalMonths = monthlyCapacity > 0 ? Math.ceil(remaining / monthlyCapacity) : Infinity

  if (desiredMonths >= naturalMonths) {
    return {
      onTrack: true,
      remaining,
      naturalMonths,
      desiredMonths,
    }
  }

  // Shortfall: how much extra needs to be covered because the timeline is compressed
  const projectedSavedByDeadline = monthlyCapacity * desiredMonths
  const gap = Math.max(0, remaining - projectedSavedByDeadline)
  const requiredMonthlyIfNoBorrowing = Math.ceil(remaining / desiredMonths)
  const extraSavingsNeededPerMonth = Math.max(0, requiredMonthlyIfNoBorrowing - monthlyCapacity)

  const options = FUNDING_SOURCES.map((source) => {
    const interestCost = Math.round(gap * (source.rate / 100) * (desiredMonths / 12))
    const totalRepay = gap + interestCost
    const monthlyEMI = Math.ceil(totalRepay / desiredMonths)
    return {
      ...source,
      gapCovered: gap,
      interestCost,
      totalRepay,
      monthlyEMI,
      // total monthly outflow if user keeps current saving pace + repays this EMI
      totalMonthlyOutflow: monthlyCapacity + monthlyEMI,
    }
  }).sort((a, b) => a.totalRepay - b.totalRepay)

  // A blended/hybrid suggestion: save a bit more AND borrow a smaller amount,
  // splitting the gap 50/50 — often the most realistic real-world path.
  const hybridGap = Math.round(gap / 2)
  const hybridExtraSaving = Math.round(extraSavingsNeededPerMonth / 2)
  const hybridBestRate = Math.min(...FUNDING_SOURCES.map((s) => s.rate).filter((r) => r > 0))
  const hybridSource = FUNDING_SOURCES.find((s) => s.rate === hybridBestRate)
  const hybridInterest = Math.round(hybridGap * (hybridBestRate / 100) * (desiredMonths / 12))
  const hybrid = {
    id: 'hybrid',
    label: `Hybrid — save more + borrow via ${hybridSource.label}`,
    type: 'Recommended',
    rate: hybridBestRate,
    risk: 'Balanced',
    riskLevel: 2,
    gapCovered: hybridGap,
    interestCost: hybridInterest,
    totalRepay: hybridGap + hybridInterest,
    monthlyEMI: Math.ceil((hybridGap + hybridInterest) / desiredMonths),
    extraSavingPerMonth: hybridExtraSaving,
    description: `Save ${hybridExtraSaving > 0 ? '₹' + hybridExtraSaving.toLocaleString('en-IN') + ' extra' : 'at your current pace'}/month and borrow only half the gap — lowers both your interest cost and your dependence on any one source.`,
  }

  return {
    onTrack: false,
    remaining,
    naturalMonths,
    desiredMonths,
    gap,
    requiredMonthlyIfNoBorrowing,
    extraSavingsNeededPerMonth,
    options,
    hybrid,
  }
}
