import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, TrendingDown, Milestone, Sparkles, ChevronDown } from 'lucide-react'
import { MotionCard, SectionHeading, Badge, fmtINR } from '@/components/ui/Primitives'
import { analyzeGoal } from '@/lib/goalSolver'

const riskDot = (level) => {
  if (level <= 1) return 'var(--teal)'
  if (level === 2) return 'var(--accent)'
  return 'var(--coral)'
}

export default function GoalAccelerator({ goal, monthlyCapacity = 5300 }) {
  const [open, setOpen] = useState(false)
  const [desiredMonths, setDesiredMonths] = useState(3)

  const analysis = analyzeGoal({
    target: goal.target,
    current: goal.current,
    monthlyCapacity,
    desiredMonths,
  })

  return (
    <MotionCard className="border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
            style={{ background: 'var(--bg-sunken)', color: 'var(--accent)' }}
          >
            <Zap size={18} />
          </span>
          <div>
            <h3 className="font-display font-semibold text-ink">Goal Accelerator — {goal.name}</h3>
            <p className="text-xs text-ink-soft">
              Want it sooner than your saving pace allows? See your options.
            </p>
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-ink-soft shrink-0">
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-5 mt-5 border-t" style={{ borderColor: 'var(--border)' }}>
              <label className="block mb-5">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink font-medium">I want this in…</span>
                  <span className="font-mono-num text-ink">{desiredMonths} month{desiredMonths > 1 ? 's' : ''}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={desiredMonths}
                  onChange={(e) => setDesiredMonths(Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </label>

              {analysis.onTrack ? (
                <div
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'var(--teal-soft)' }}
                >
                  <Sparkles size={18} style={{ color: 'var(--teal)' }} className="shrink-0 mt-0.5" />
                  <p className="text-sm" style={{ color: 'var(--teal)' }}>
                    At {fmtINR(monthlyCapacity)}/month, you'll reach {fmtINR(goal.target)} in{' '}
                    <strong>{analysis.naturalMonths} months</strong> — that's within your {desiredMonths}-month
                    target already. No borrowing needed.
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-xl p-4 mb-5 flex items-start gap-3"
                    style={{ background: 'var(--coral-soft)' }}
                  >
                    <TrendingDown size={18} style={{ color: 'var(--coral)' }} className="shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: 'var(--coral)' }}>
                      At your current pace, this goal takes <strong>{analysis.naturalMonths} months</strong> —{' '}
                      {analysis.naturalMonths - desiredMonths} month{analysis.naturalMonths - desiredMonths > 1 ? 's' : ''} longer
                      than you want. To hit {desiredMonths} months on savings alone you'd need{' '}
                      <strong>{fmtINR(analysis.requiredMonthlyIfNoBorrowing)}/month</strong> — {fmtINR(analysis.extraSavingsNeededPerMonth)} more than your current capacity.
                      Here's how to close that {fmtINR(analysis.gap)} gap.
                    </p>
                  </div>

                  {/* Recommended hybrid path */}
                  <div
                    className="rounded-xl p-4 mb-5"
                    style={{ background: 'var(--bg-sunken)', border: '1px solid var(--accent)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Milestone size={16} style={{ color: 'var(--accent)' }} />
                      <span className="text-sm font-semibold text-ink">Suggested path</span>
                      <Badge tone="accent">Recommended</Badge>
                    </div>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {analysis.hybrid.description} Over {desiredMonths} months this costs about{' '}
                      <span className="font-mono-num font-medium text-ink">{fmtINR(analysis.hybrid.interestCost)}</span>{' '}
                      in interest — a monthly repayment of{' '}
                      <span className="font-mono-num font-medium text-ink">{fmtINR(analysis.hybrid.monthlyEMI)}</span>.
                    </p>
                  </div>

                  <SectionHeading title="Compare all funding options" />
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead>
                        <tr className="text-left text-xs text-ink-faint">
                          <th className="pb-2 pl-1 font-medium">Source</th>
                          <th className="pb-2 font-medium">Rate</th>
                          <th className="pb-2 font-medium">Risk</th>
                          <th className="pb-2 font-medium">Interest cost</th>
                          <th className="pb-2 pr-1 font-medium">Monthly EMI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.options.map((o, i) => (
                          <motion.tr
                            key={o.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-t"
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <td className="py-3 pl-1">
                              <p className="font-medium text-ink">{o.label}</p>
                              <p className="text-xs text-ink-faint">{o.type}</p>
                            </td>
                            <td className="py-3 font-mono-num text-ink">{o.rate}%</td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: riskDot(o.riskLevel) }} />
                                {o.risk}
                              </span>
                            </td>
                            <td className="py-3 font-mono-num text-ink">{fmtINR(o.interestCost)}</td>
                            <td className="py-3 pr-1 font-mono-num font-medium text-ink">{fmtINR(o.monthlyEMI)}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-ink-faint mt-3">
                    Interest shown is simple interest over the {desiredMonths}-month tenure. P2P and NBFC figures are
                    simulated for this demo — see the P2P Lending and licensing notes elsewhere in the app.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionCard>
  )
}
