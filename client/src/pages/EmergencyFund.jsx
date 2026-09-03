import { useState, useEffect } from 'react'
import { ShieldPlus, Loader2, AlertCircle } from 'lucide-react'
import { MotionCard, SectionHeading, ProgressBar, Badge, fmtINR } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { goalApi } from '@/lib/api'

const EMERGENCY_GOAL_NAME = 'Emergency Fund'
const RECOMMENDED_MONTHS = 3

export default function EmergencyFund() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contribution, setContribution] = useState(2800)

  useEffect(() => {
    if (!user) return
    goalApi.list()
      .then(async (goals) => {
        let fund = goals.find((g) => g.goalName === EMERGENCY_GOAL_NAME)
        if (!fund) {
          const target = Math.max(1, user.monthlyExpenseAvg) * RECOMMENDED_MONTHS
          fund = await goalApi.create({ goalName: EMERGENCY_GOAL_NAME, targetAmount: target })
        }
        setGoal(fund)
        setContribution(user.monthlySavingAvg || 2000)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Setting up your fund…
      </div>
    )
  }

  if (error || !goal) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
        <AlertCircle size={16} /> {error || 'Could not load your emergency fund.'}
      </div>
    )
  }

  const remaining = goal.targetAmount - goal.currentSaved
  const monthsLeft = Math.max(1, Math.ceil(remaining / Math.max(1, contribution)))
  const pct = Math.round((goal.currentSaved / goal.targetAmount) * 100)

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeading
        eyebrow="Emergency fund saver"
        title="Build your safety net"
        description={`Recommended target: ${RECOMMENDED_MONTHS} months of expenses, based on your profile.`}
      />

      <MotionCard>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-ink-soft">Current fund</p>
            <p className="font-mono-num text-3xl font-semibold text-ink">{fmtINR(goal.currentSaved)}</p>
          </div>
          <Badge tone="accent">{pct}% funded</Badge>
        </div>
        <ProgressBar value={goal.currentSaved} max={goal.targetAmount} height={10} />
        <p className="text-xs text-ink-soft mt-2">
          Target: {fmtINR(goal.targetAmount)} · {fmtINR(remaining)} to go
        </p>
      </MotionCard>

      <MotionCard delay={0.1}>
        <SectionHeading title="Adjust your monthly contribution" />
        <input
          type="range"
          min={500}
          max={8000}
          step={100}
          value={contribution}
          onChange={(e) => setContribution(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-sm mt-2">
          <span className="text-ink-soft">₹500/mo</span>
          <span className="font-mono-num font-semibold text-ink">{fmtINR(contribution)}/mo</span>
          <span className="text-ink-soft">₹8,000/mo</span>
        </div>
        <div
          className="mt-5 rounded-xl p-4 flex items-start gap-3"
          style={{ background: 'var(--teal-soft)' }}
        >
          <ShieldPlus size={20} style={{ color: 'var(--teal)' }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: 'var(--teal)' }}>
            At {fmtINR(contribution)}/month, you'll reach your {fmtINR(goal.targetAmount)} target
            in <strong>{monthsLeft} months</strong> — around {monthsLeft <= 6 ? 'well ahead of' : 'in line with'} a
            typical {RECOMMENDED_MONTHS}-month expense buffer for {(user?.employmentType || 'a gig worker').toLowerCase()}s.
          </p>
        </div>
      </MotionCard>

      <MotionCard delay={0.15} className="text-sm text-ink-soft">
        This fund is tracked as a regular Goal (named "{EMERGENCY_GOAL_NAME}") behind the
        scenes — money set aside here is a simulated planning balance for demo purposes.
        FinAssist doesn't move real funds on your behalf.
      </MotionCard>
    </div>
  )
}
