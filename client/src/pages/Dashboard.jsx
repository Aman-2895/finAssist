import { useEffect, useState } from 'react'
import { Wallet, PiggyBank, TrendingUp, Target, ArrowUpRight, Loader2 } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { MotionCard, StatCard, SectionHeading, ProgressBar, Badge, fmtINR } from '@/components/ui/Primitives'
import ScoreGauge from '@/components/ui/ScoreGauge'
import { useAuth } from '@/context/AuthContext'
import { expenseApi, creditScoreApi, goalApi, plannedExpenseApi } from '@/lib/api'

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function parseMonthKey(key) {
  const [year, month] = key.split('-').map(Number)
  return { label: monthNames[month - 1], year }
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-ink mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono-num">
          {p.name}: {fmtINR(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState([])
  const [score, setScore] = useState(null)
  const [goals, setGoals] = useState([])
  const [planned, setPlanned] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      expenseApi.monthlySummary(),
      creditScoreApi.me().catch(() => null),
      goalApi.list().catch(() => []),
      plannedExpenseApi.list().catch(() => []),
    ]).then(([sum, sc, gl, pl]) => {
      setSummary(sum.sort((a, b) => a.month.localeCompare(b.month)).map((m) => ({ ...m, ...parseMonthKey(m.month) })))
      setScore(sc)
      setGoals(gl)
      setPlanned(pl)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading your dashboard…
      </div>
    )
  }

  const latestMonth = summary[summary.length - 1]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-soft">Welcome back,</p>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">{(user?.name || 'there').split(' ')[0]} 👋</h2>
        <p className="text-sm text-ink-soft mt-1">{user?.employmentType} · Here's how this month is shaping up.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This month's income" value={latestMonth ? fmtINR(latestMonth.income) : '—'} delta={latestMonth ? undefined : 'No data yet'} icon={Wallet} delay={0} />
        <StatCard label="This month's saving" value={latestMonth ? fmtINR(latestMonth.saving) : '—'} icon={PiggyBank} accent="teal" delay={0.05} />
        <StatCard label="Credit score" value={score?.score ?? '—'} delta={score ? 'Rule-based' : undefined} icon={TrendingUp} accent="teal" delay={0.1} />
        <StatCard label="Active goals" value={goals.length} icon={Target} accent="coral" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionCard delay={0.1} className="lg:col-span-2">
          <SectionHeading
            eyebrow="Trend"
            title="Income vs expenses"
            description="Tracked from manual entries and parsed statement uploads."
          />
          {summary.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary} margin={{ left: -20, right: 10, top: 10 }}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-faint)', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--ink-faint)', fontSize: 11 }} width={0} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="var(--teal)" fill="url(#income)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--coral)" fill="url(#expense)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-ink-faint py-16 text-center">
              No expenses logged yet — log a few transactions to see this chart fill in.
            </p>
          )}
        </MotionCard>

        <MotionCard delay={0.15} className="flex flex-col items-center">
          <SectionHeading title="Credit health" description="Weighted score from your alternative data." />
          {score ? (
            <>
              <ScoreGauge score={score.score} />
              <Link to="/credit-score" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--teal)' }}>
                View breakdown <ArrowUpRight size={15} />
              </Link>
            </>
          ) : (
            <p className="text-sm text-ink-faint py-10 text-center">
              Complete your financial profile to generate a score.
            </p>
          )}
        </MotionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionCard delay={0.1}>
          <SectionHeading title="Goals in progress" />
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((g) => (
                <div key={g._id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-ink font-medium">{g.goalName}</span>
                    <span className="text-ink-faint font-mono-num text-xs">
                      {Math.round((g.currentSaved / g.targetAmount) * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={g.currentSaved} max={g.targetAmount} color="var(--accent)" height={6} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No goals set yet.</p>
          )}
          <Link to="/goals" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--teal)' }}>
            {goals.length > 0 ? 'See all goals' : 'Set your first goal'} <ArrowUpRight size={15} />
          </Link>
        </MotionCard>

        <MotionCard delay={0.15}>
          <SectionHeading title="Upcoming known expenses" />
          {planned.length > 0 ? (
            <div className="space-y-3">
              {planned.slice(0, 4).map((p) => (
                <div key={p._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-ink font-medium">{p.title}</p>
                    <p className="text-xs text-ink-faint">{p.month} {p.year}</p>
                  </div>
                  <Badge tone="warn">{fmtINR(p.amount)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-faint">Nothing planned yet.</p>
          )}
          <Link to="/calendar" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--teal)' }}>
            Open calendar <ArrowUpRight size={15} />
          </Link>
        </MotionCard>

        <MotionCard delay={0.2}>
          <SectionHeading title="Your profile snapshot" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">Avg. monthly income</span><span className="font-mono-num text-ink">{fmtINR(user?.monthlyIncomeAvg || 0)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Avg. monthly expense</span><span className="font-mono-num text-ink">{fmtINR(user?.monthlyExpenseAvg || 0)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Existing debt</span><span className="font-mono-num text-ink">{fmtINR(user?.existingDebt || 0)}</span></div>
          </div>
          <Link to="/profile" className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--teal)' }}>
            Update profile <ArrowUpRight size={15} />
          </Link>
        </MotionCard>
      </div>
    </div>
  )
}
