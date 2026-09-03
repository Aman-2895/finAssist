import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Sparkles, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { MotionCard, SectionHeading, Badge, fmtINR } from '@/components/ui/Primitives'
import { expenseApi, plannedExpenseApi } from '@/lib/api'

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseMonthKey(key) {
  // key format from backend: "YYYY-M" (M is 1-based)
  const [year, month] = key.split('-').map(Number)
  return { label: monthNames[month - 1], year }
}

export default function CalendarPage() {
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState([])
  const [monthIdx, setMonthIdx] = useState(0)
  const [planned, setPlanned] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', month: 'Oct', year: new Date().getFullYear(), category: 'Travel' })
  const [advisory, setAdvisory] = useState({})

  const loadAll = () => {
    setLoading(true)
    Promise.all([expenseApi.monthlySummary(), plannedExpenseApi.list()])
      .then(([sum, plan]) => {
        const parsed = sum
          .sort((a, b) => a.month.localeCompare(b.month))
          .map((m) => ({ ...m, ...parseMonthKey(m.month) }))
        setSummary(parsed)
        setMonthIdx(Math.max(0, parsed.length - 1))
        setPlanned(plan)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadAll, [])

  const avgSurplus = useMemo(
    () => (summary.length ? Math.round(summary.reduce((s, m) => s + m.saving, 0) / summary.length) : 0),
    [summary]
  )

  const addPlanned = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount) return
    try {
      const created = await plannedExpenseApi.create({ ...form, amount: Number(form.amount) })
      setPlanned((p) => [...p, created])
      setForm({ title: '', amount: '', month: 'Oct', year: new Date().getFullYear(), category: 'Travel' })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const removePlanned = async (id) => {
    try {
      await plannedExpenseApi.remove(id)
      setPlanned((p) => p.filter((x) => x._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const loadAdvisory = async (id) => {
    try {
      const adv = await plannedExpenseApi.advisory(id)
      setAdvisory((a) => ({ ...a, [id]: adv }))
    } catch { /* non-critical */ }
  }

  useEffect(() => {
    planned.forEach((p) => { if (!advisory[p._id]) loadAdvisory(p._id) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planned])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading your calendar…
      </div>
    )
  }

  const current = summary[monthIdx]

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Calendar"
        title="Plan your months"
        description="Look back at what you spent and saved, or flag a big expense ahead so FinAssist can advise you early."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="inline-flex rounded-xl p-1" style={{ background: 'var(--bg-sunken)' }}>
        {[
          { id: 'overview', label: 'Monthly overview' },
          { id: 'planning', label: 'Forward planning' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{ color: tab === t.id ? 'var(--accent-ink)' : 'var(--ink-soft)' }}
          >
            {tab === t.id && (
              <motion.span
                layoutId="cal-tab"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            {summary.length === 0 ? (
              <MotionCard className="text-center py-10">
                <p className="text-sm text-ink-soft">No expenses logged yet — log some transactions to see your monthly overview here.</p>
              </MotionCard>
            ) : (
              <>
                <MotionCard>
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={() => setMonthIdx((i) => Math.max(0, i - 1))}
                      disabled={monthIdx === 0}
                      className="p-2 rounded-lg text-ink-soft hover:text-ink disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h3 className="font-display font-semibold text-lg text-ink">{current.label} {current.year}</h3>
                    <button
                      onClick={() => setMonthIdx((i) => Math.min(summary.length - 1, i + 1))}
                      disabled={monthIdx === summary.length - 1}
                      className="p-2 rounded-lg text-ink-soft hover:text-ink disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-ink-faint mb-1">Income</p>
                      <p className="font-mono-num font-semibold text-lg" style={{ color: 'var(--teal)' }}>{fmtINR(current.income)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-faint mb-1">Expenses</p>
                      <p className="font-mono-num font-semibold text-lg" style={{ color: 'var(--coral)' }}>{fmtINR(current.expense)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-faint mb-1">Saved</p>
                      <p className="font-mono-num font-semibold text-lg text-ink">{fmtINR(current.saving)}</p>
                    </div>
                  </div>
                </MotionCard>

                <MotionCard delay={0.05}>
                  <SectionHeading title="Calendar strip" />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {summary.map((m, i) => (
                      <button
                        key={m.month}
                        onClick={() => setMonthIdx(i)}
                        className="rounded-xl p-3 text-left transition-colors"
                        style={{
                          background: i === monthIdx ? 'var(--accent)' : 'var(--bg-sunken)',
                          color: i === monthIdx ? 'var(--accent-ink)' : 'var(--ink)',
                        }}
                      >
                        <p className="text-xs font-medium opacity-80">{m.label}</p>
                        <p className="font-mono-num text-sm font-semibold mt-1">{fmtINR(m.saving)}</p>
                        <p className="text-[10px] opacity-70">saved</p>
                      </button>
                    ))}
                  </div>
                </MotionCard>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="planning" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            <MotionCard>
              <div className="flex items-center justify-between mb-4">
                <SectionHeading title="Known upcoming expenses" action={null} />
                <button
                  onClick={() => setShowForm((s) => !s)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                >
                  {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? 'Cancel' : 'Add expense'}
                </button>
              </div>

              {showForm && (
                <form onSubmit={addPlanned} className="grid sm:grid-cols-4 gap-3 mb-5 p-4 rounded-xl" style={{ background: 'var(--bg-sunken)' }}>
                  <input
                    placeholder="e.g. Sister's wedding gift"
                    className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none focus:border-[var(--accent)] sm:col-span-2"
                    style={{ borderColor: 'var(--border)' }}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
                    style={{ borderColor: 'var(--border)' }}
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                  <select
                    className="rounded-lg px-3 py-2 text-sm bg-transparent border outline-none"
                    style={{ borderColor: 'var(--border)' }}
                    value={form.month}
                    onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                  >
                    {monthNames.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <button type="submit" className="sm:col-span-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--teal)', color: 'white' }}>
                    Add to calendar
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {planned.map((p) => {
                  const adv = advisory[p._id]
                  return (
                    <div key={p._id} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: 'var(--bg-sunken)' }}>
                      <div>
                        <p className="text-sm font-medium text-ink">{p.title}</p>
                        <p className="text-xs text-ink-faint">{p.month} {p.year} · {p.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono-num font-semibold text-ink">{fmtINR(p.amount)}</p>
                          {adv && <Badge tone={adv.overBudget ? 'warn' : 'good'}>{adv.overBudget ? 'Above surplus' : 'Within surplus'}</Badge>}
                        </div>
                        <button onClick={() => removePlanned(p._id)} className="p-1.5 rounded-lg text-ink-faint hover:text-[var(--coral)]" aria-label="Remove">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
                {planned.length === 0 && <p className="text-sm text-ink-faint text-center py-6">No upcoming expenses planned yet.</p>}
              </div>
            </MotionCard>

            {avgSurplus > 0 && (
              <MotionCard delay={0.1} className="flex items-start gap-3" style={{ background: 'var(--teal-soft)' }}>
                <Sparkles size={20} style={{ color: 'var(--teal)' }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--teal)' }}>FinAssist advisory</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--teal)' }}>
                    Your average monthly surplus is {fmtINR(avgSurplus)}. Expenses above that in the
                    list will be flagged "Above surplus" — start setting aside extra a couple of
                    months ahead for those.
                  </p>
                </div>
              </MotionCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
