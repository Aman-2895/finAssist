import { useState, useEffect } from 'react'
import { Plus, Target, X, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import { MotionCard, SectionHeading, ProgressBar, fmtINR } from '@/components/ui/Primitives'
import GoalAccelerator from '@/components/ui/GoalAccelerator'
import { useAuth } from '@/context/AuthContext'
import { goalApi } from '@/lib/api'

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', targetDate: '' })

  const loadGoals = () => {
    setLoading(true)
    goalApi.list()
      .then(setGoals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadGoals, [])

  const addGoal = async (e) => {
    e.preventDefault()
    if (!form.name || !form.target) return
    try {
      await goalApi.create({ goalName: form.name, targetAmount: Number(form.target), targetDate: form.targetDate || undefined })
      setForm({ name: '', target: '', targetDate: '' })
      setShowForm(false)
      loadGoals()
    } catch (err) {
      setError(err.message)
    }
  }

  const removeGoal = async (id) => {
    try {
      await goalApi.remove(id)
      loadGoals()
    } catch (err) {
      setError(err.message)
    }
  }

  const monthsToGoal = (g) => {
    if (!g.targetDate) return null
    return Math.max(1, Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading your goals…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Goal financial planning"
        title="Your goals"
        description="Set a target, and FinAssist breaks it into a monthly savings plan."
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'New goal'}
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {showForm && (
        <MotionCard>
          <form onSubmit={addGoal} className="grid sm:grid-cols-3 gap-4">
            <input
              placeholder="Goal name (e.g. New phone)"
              className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Target amount (₹)"
              className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
              value={form.target}
              onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
            />
            <input
              type="date"
              className="rounded-xl px-3.5 py-2.5 text-sm bg-transparent border outline-none focus:border-[var(--accent)]"
              style={{ borderColor: 'var(--border)' }}
              value={form.targetDate}
              onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
            />
            <button
              type="submit"
              className="sm:col-span-3 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--teal)', color: 'white' }}
            >
              Create goal
            </button>
          </form>
        </MotionCard>
      )}

      {goals.length === 0 ? (
        <MotionCard className="text-center py-10">
          <p className="text-sm text-ink-soft">No goals yet — create your first one above.</p>
        </MotionCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g, i) => {
            const months = monthsToGoal(g)
            const remaining = g.targetAmount - g.currentSaved
            const monthlyNeed = months ? Math.ceil(remaining / months) : null
            return (
              <MotionCard key={g._id} delay={i * 0.05} className="relative group">
                <button
                  onClick={() => removeGoal(g._id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-faint opacity-0 group-hover:opacity-100 hover:text-[var(--coral)] transition-opacity"
                  aria-label="Delete goal"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="grid place-items-center w-10 h-10 rounded-xl"
                    style={{ background: 'var(--bg-sunken)', color: 'var(--accent)' }}
                  >
                    <Target size={18} />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-ink">{g.goalName}</h3>
                    {g.targetDate && <p className="text-xs text-ink-faint">By {new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
                  </div>
                </div>
                <p className="font-mono-num font-semibold text-xl text-ink">
                  {fmtINR(g.currentSaved)} <span className="text-sm text-ink-faint font-normal">/ {fmtINR(g.targetAmount)}</span>
                </p>
                <div className="mt-3">
                  <ProgressBar value={g.currentSaved} max={g.targetAmount} />
                </div>
                {monthlyNeed && (
                  <p className="text-xs text-ink-soft mt-2">
                    Save ~<span className="font-mono-num font-medium text-ink">{fmtINR(monthlyNeed)}</span>/month to hit this on time
                  </p>
                )}
              </MotionCard>
            )
          })}
        </div>
      )}

      {goals.length > 0 && (
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Need it sooner?"
            title="Goal Accelerator"
            description="Set how soon you actually want each goal — if that's tighter than your saving pace, see ranked funding options with the interest-vs-risk tradeoff made explicit."
          />
          {goals.map((g) => (
            <GoalAccelerator
              key={g._id}
              goal={{ name: g.goalName, target: g.targetAmount, current: g.currentSaved }}
              monthlyCapacity={user?.monthlySavingAvg || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
