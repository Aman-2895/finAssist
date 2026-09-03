import { useEffect, useState } from 'react'
import { TrendingUp, Repeat, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { MotionCard, SectionHeading, Badge, fmtINR } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { investmentApi } from '@/lib/api'

const INSTRUMENTS = [
  { id: 'micro-sip', type: 'Recurring Micro-SIP', frequency: 'Weekly', projectedReturn: '11–13% p.a.', risk: 'Low' },
  { id: 'digital-gold', type: 'Digital Gold (micro)', frequency: 'Monthly', projectedReturn: '8–10% p.a.', risk: 'Very Low' },
  { id: 'liquid-fund', type: 'Liquid Fund', frequency: 'Monthly', projectedReturn: '6–7% p.a.', risk: 'Very Low' },
]

export default function Investments() {
  const { user } = useAuth()
  const [suggestion, setSuggestion] = useState(null)
  const [myInvestments, setMyInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [addedId, setAddedId] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      investmentApi.suggest(user.monthlyIncomeAvg, user.monthlyExpenseAvg),
      investmentApi.list(),
    ])
      .then(([sug, list]) => {
        setSuggestion(sug)
        setMyInvestments(list)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const simulate = async (inst) => {
    try {
      const created = await investmentApi.create({
        instrumentType: inst.type,
        amountInvested: suggestion?.suggestedAmount || 500,
        frequency: inst.frequency,
        risk: inst.risk,
      })
      setMyInvestments((list) => [created, ...list])
      setAddedId(inst.id)
      setTimeout(() => setAddedId(null), 2000)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Working out your surplus…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Micro-investment advisor"
        title="Grow your surplus, safely"
        description="Suggestions are simulated — sized to fit irregular income, not a fixed salary."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {suggestion && (
        <MotionCard style={{ background: 'var(--teal-soft)' }}>
          <p className="text-sm" style={{ color: 'var(--teal)' }}>
            Your monthly surplus is about <strong>{fmtINR(suggestion.surplus)}</strong>. FinAssist
            suggests putting roughly <strong>{fmtINR(suggestion.suggestedAmount)}</strong> toward
            a {suggestion.suggestion.risk.toLowerCase()}-risk instrument like{' '}
            {suggestion.suggestion.instrumentType}, {suggestion.suggestion.frequency.toLowerCase()}.
          </p>
        </MotionCard>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {INSTRUMENTS.map((inv, i) => (
          <MotionCard key={inv.id} delay={i * 0.06} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span
                className="grid place-items-center w-10 h-10 rounded-xl"
                style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}
              >
                <TrendingUp size={18} />
              </span>
              <Badge tone={inv.risk === 'Very Low' ? 'good' : 'accent'}>{inv.risk} risk</Badge>
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-ink">{inv.type}</h3>
              <p className="text-sm text-ink-soft mt-1 flex items-center gap-1.5">
                <Repeat size={13} /> {fmtINR(suggestion?.suggestedAmount || 500)} · {inv.frequency}
              </p>
            </div>
            <div className="mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs text-ink-faint">Projected return</p>
              <p className="font-mono-num font-semibold text-ink">{inv.projectedReturn}</p>
            </div>
            <button
              onClick={() => simulate(inv)}
              className="w-full py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-[var(--bg-sunken)] flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--border)', color: addedId === inv.id ? 'var(--teal)' : 'var(--ink)' }}
            >
              {addedId === inv.id ? <><CheckCircle2 size={15} /> Added</> : 'Simulate this plan'}
            </button>
          </MotionCard>
        ))}
      </div>

      {myInvestments.length > 0 && (
        <MotionCard delay={0.15}>
          <SectionHeading title="Your simulated investments" />
          <div className="space-y-2">
            {myInvestments.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <p className="text-sm font-medium text-ink">{inv.instrumentType}</p>
                  <p className="text-xs text-ink-faint">{inv.frequency} · {inv.risk} risk</p>
                </div>
                <p className="font-mono-num text-sm text-ink">{fmtINR(inv.amountInvested)}</p>
              </div>
            ))}
          </div>
        </MotionCard>
      )}

      <MotionCard delay={0.2}>
        <SectionHeading title="How the suggestion works" />
        <p className="text-sm text-ink-soft leading-relaxed">
          Your average monthly surplus (income minus expenses) is capped at 15% for the
          suggested investment amount, favouring low-risk instruments given income
          irregularity. No real brokerage connection — this is a planning simulation you can
          act on manually.
        </p>
      </MotionCard>
    </div>
  )
}
