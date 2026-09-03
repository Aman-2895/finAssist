// Server-side mirror of client/src/lib/goalSolver.js so the same funding-gap
// logic can run in the API (for the Goal Accelerator) without depending on
// the browser bundle. Keep these two files in sync if the model changes.

const FUNDING_SOURCES = [
  { id: 'family', label: 'Family / community lending circle', type: 'Informal', rate: 0, risk: 'Social risk', riskLevel: 1 },
  { id: 'p2p_vetted', label: 'P2P — vetted lender match', type: 'Simulated marketplace', rate: 10, risk: 'Medium — slower match', riskLevel: 2 },
  { id: 'p2p_fast', label: 'P2P — fast match', type: 'Simulated marketplace', rate: 13.5, risk: 'Medium — higher rate for speed', riskLevel: 3 },
  { id: 'nbfc', label: 'NBFC micro-loan (regulated)', type: 'Formal / regulated', rate: 18, risk: 'Low institutional risk, higher cost', riskLevel: 2 },
]

function analyzeGoal({ target, current, monthlyCapacity, desiredMonths }) {
  const remaining = Math.max(0, target - current)
  const naturalMonths = monthlyCapacity > 0 ? Math.ceil(remaining / monthlyCapacity) : Infinity

  if (desiredMonths >= naturalMonths) {
    return { onTrack: true, remaining, naturalMonths, desiredMonths }
  }

  const projectedSavedByDeadline = monthlyCapacity * desiredMonths
  const gap = Math.max(0, remaining - projectedSavedByDeadline)
  const requiredMonthlyIfNoBorrowing = Math.ceil(remaining / desiredMonths)
  const extraSavingsNeededPerMonth = Math.max(0, requiredMonthlyIfNoBorrowing - monthlyCapacity)

  const options = FUNDING_SOURCES.map((source) => {
    const interestCost = Math.round(gap * (source.rate / 100) * (desiredMonths / 12))
    const totalRepay = gap + interestCost
    const monthlyEMI = Math.ceil(totalRepay / desiredMonths)
    return { ...source, gapCovered: gap, interestCost, totalRepay, monthlyEMI }
  }).sort((a, b) => a.totalRepay - b.totalRepay)

  const hybridGap = Math.round(gap / 2)
  const hybridExtraSaving = Math.round(extraSavingsNeededPerMonth / 2)
  const hybridBestRate = Math.min(...FUNDING_SOURCES.map((s) => s.rate).filter((r) => r > 0))
  const hybridInterest = Math.round(hybridGap * (hybridBestRate / 100) * (desiredMonths / 12))
  const hybrid = {
    id: 'hybrid',
    label: 'Hybrid — save more + borrow the rest',
    rate: hybridBestRate,
    gapCovered: hybridGap,
    interestCost: hybridInterest,
    totalRepay: hybridGap + hybridInterest,
    monthlyEMI: Math.ceil((hybridGap + hybridInterest) / desiredMonths),
    extraSavingPerMonth: hybridExtraSaving,
  }

  return { onTrack: false, remaining, naturalMonths, desiredMonths, gap, requiredMonthlyIfNoBorrowing, extraSavingsNeededPerMonth, options, hybrid }
}

module.exports = { analyzeGoal, FUNDING_SOURCES }
