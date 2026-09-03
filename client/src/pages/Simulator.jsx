import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Calculator, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { MotionCard, SectionHeading, ProgressBar, fmtINR } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { simulationApi } from '@/lib/api'

const CATEGORIES = ['Groceries', 'Transport', 'EMI', 'Rent', 'Phone', 'Medical', 'Entertainment', 'Other']
const palette = ['#F2A93B', '#1E6E62', '#E4572E', '#2C4A52', '#8A9A9E', '#4CB3A0', '#F0805C', '#B9C6C9']

export default function Simulator() {
  const { user } = useAuth()
  const [income, setIncome] = useState(user?.monthlyIncomeAvg || 15000)
  const [amounts, setAmounts] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, c === 'Rent' ? 5000 : c === 'EMI' ? 1500 : 0]))
  )
  const [report, setReport] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  const totalExpense = useMemo(() => Object.values(amounts).reduce((a, b) => a + Number(b || 0), 0), [amounts])
  const remaining = income - totalExpense

  const chartData = CATEGORIES
    .map((c, i) => ({ name: c, value: Number(amounts[c] || 0), color: palette[i % palette.length] }))
    .filter((d) => d.value > 0)

  const runSimulation = async () => {
    setRunning(true)
    setError(null)
    try {
      const categories = CATEGORIES.map((name) => ({ name, amount: Number(amounts[name] || 0) }))
      const result = await simulationApi.run(income, categories)
      setReport(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Expense simulator"
        title="Build a what-if budget"
        description="Pick your categories, enter amounts, and get an instant report on what's left over."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <MotionCard>
          <label className="block mb-5">
            <span className="text-sm font-medium text-ink">Monthly income to simulate against (₹)</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
            />
          </label>

          <div className="space-y-4">
            {CATEGORIES.map((c) => (
              <div key={c}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink">{c}</span>
                  <span className="font-mono-num text-ink-soft">{fmtINR(amounts[c] || 0)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={c === 'Rent' ? 12000 : c === 'EMI' ? 6000 : 4000}
                  step={100}
                  value={amounts[c] || 0}
                  onChange={(e) => setAmounts((a) => ({ ...a, [c]: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            onClick={runSimulation}
            disabled={running}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            {running ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />} {running ? 'Running…' : 'Generate report'}
          </button>
        </MotionCard>

        <div className="space-y-6">
          <MotionCard delay={0.05}>
            <SectionHeading title="Category split" />
            <div className="h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtINR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-faint text-center pt-20">Add amounts to see the split.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {chartData.map((d) => (
                <span key={d.name} className="text-xs flex items-center gap-1.5 text-ink-soft">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                </span>
              ))}
            </div>
          </MotionCard>

          <MotionCard delay={0.1}>
            <SectionHeading title="Balance overview" />
            <p className="text-sm text-ink-soft">Remaining after expenses</p>
            <p
              className="font-mono-num font-bold text-3xl mt-1"
              style={{ color: remaining >= 0 ? 'var(--teal)' : 'var(--coral)' }}
            >
              {fmtINR(remaining)}
            </p>
            <div className="mt-3">
              <ProgressBar
                value={Math.min(totalExpense, income)}
                max={income}
                color={totalExpense > income ? 'var(--coral)' : 'var(--accent)'}
              />
            </div>
            <p className="text-xs text-ink-faint mt-2">
              {fmtINR(totalExpense)} of {fmtINR(income)} allocated
            </p>
          </MotionCard>

          <AnimatePresence>
            {report && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <MotionCard className="flex items-start gap-3" style={{ background: 'var(--teal-soft)' }}>
                  <Sparkles size={20} style={{ color: 'var(--teal)' }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--teal)' }}>Simulation report</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--teal)' }}>{report.verdict}</p>
                  </div>
                </MotionCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
