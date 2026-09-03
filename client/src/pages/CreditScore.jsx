import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Loader2, AlertCircle } from 'lucide-react'
import { MotionCard, SectionHeading, ProgressBar, Badge } from '@/components/ui/Primitives'
import ScoreGauge from '@/components/ui/ScoreGauge'
import { creditScoreApi } from '@/lib/api'

const FACTOR_LABELS = {
  incomeRegularity: 'Income regularity',
  expenseToIncomeRatio: 'Expense-to-income ratio',
  savingsConsistency: 'Savings consistency',
  billPunctuality: 'Bill punctuality',
  debtBurden: 'Existing debt burden',
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="text-ink font-medium">{label}</p>
      <p className="font-mono-num" style={{ color: 'var(--accent)' }}>Score: {payload[0].value}</p>
    </div>
  )
}

export default function CreditScore() {
  const [score, setScore] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([creditScoreApi.me(), creditScoreApi.history()])
      .then(([current, hist]) => {
        setScore(current)
        setHistory(
          hist.map((h) => ({
            month: new Date(h.createdAt).toLocaleDateString('en-IN', { month: 'short' }),
            score: h.score,
          }))
        )
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Computing your score…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
        <AlertCircle size={16} /> {error}
      </div>
    )
  }

  const factors = Object.entries(score.factors).map(([key, value]) => ({
    label: FACTOR_LABELS[key] || key,
    value,
  }))

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Alternative credit scoring"
        title="Your FinAssist score"
        description="Built entirely from your self-reported profile and logged transactions — no credit bureau involved."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionCard className="flex flex-col items-center justify-center">
          <ScoreGauge score={score.score} size={240} />
          <p className="text-xs text-ink-faint mt-4 text-center max-w-[200px]">
            Rule-based weighted model, scaled 300–900 to feel familiar.
          </p>
        </MotionCard>

        <MotionCard delay={0.1} className="lg:col-span-2">
          <SectionHeading title="What's driving your score" />
          <div className="space-y-4">
            {factors.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ink">{f.label}</span>
                  <span className="font-mono-num text-ink-faint text-xs">{f.value}/100</span>
                </div>
                <ProgressBar value={f.value} color={f.value > 70 ? 'var(--teal)' : f.value > 45 ? 'var(--accent)' : 'var(--coral)'} />
              </div>
            ))}
          </div>
        </MotionCard>
      </div>

      {history.length > 1 && (
        <MotionCard delay={0.15}>
          <SectionHeading title="Score trend" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-faint)', fontSize: 12 }} />
                <YAxis domain={[300, 900]} tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-faint)', fontSize: 11 }} width={0} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>
      )}

      <MotionCard delay={0.2}>
        <div className="flex items-center justify-between mb-3">
          <SectionHeading title="How this score is computed" description={null} action={null} />
          <Badge tone="good">Rule-based</Badge>
        </div>
        <p className="text-sm text-ink-soft leading-relaxed -mt-3">
          Each factor above is weighted (25% income regularity, 20% expense ratio, 25% savings
          consistency, 15% bill punctuality, 15% debt burden) and combined into a 0–100
          composite, then scaled onto a familiar 300–900 band. Log more transactions and update
          your profile to see this recalculate.
        </p>
      </MotionCard>
    </div>
  )
}
