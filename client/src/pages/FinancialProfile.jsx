import { useState, useEffect } from 'react'
import { Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { MotionCard, SectionHeading } from '@/components/ui/Primitives'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/lib/api'

const Field = ({ label, children, hint }) => (
  <label className="block">
    <span className="text-sm font-medium text-ink">{label}</span>
    {children}
    {hint && <span className="text-xs text-ink-faint mt-1 block">{hint}</span>}
  </label>
)

const inputCls =
  'mt-1.5 w-full rounded-xl px-3.5 py-2.5 text-sm text-ink bg-transparent border outline-none transition-colors focus:border-[var(--accent)]'

const EMPLOYMENT_TYPES = [
  'Gig worker — delivery partner',
  'Gig worker — ride-hailing driver',
  'Domestic / home-based worker',
  'Street vendor / small trader',
  'Freelancer',
  'Other informal work',
  // 'Salaried employed',
  // 'Self-employed / business owner',
  // 'Unemployed',
  // 'Student',
]

export default function FinancialProfile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        employmentType: user.employmentType || EMPLOYMENT_TYPES[0],
        monthlyIncomeAvg: user.monthlyIncomeAvg || 0,
        monthlyExpenseAvg: user.monthlyExpenseAvg || 0,
        monthlySavingAvg: user.monthlySavingAvg || 0,
        existingDebt: user.existingDebt || 0,
        selfReportedCibil: user.selfReportedCibil || '',
        dependents: user.dependents || 0,
      })
    }
  }, [user])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await userApi.update({
        ...form,
        monthlyIncomeAvg: Number(form.monthlyIncomeAvg),
        monthlyExpenseAvg: Number(form.monthlyExpenseAvg),
        monthlySavingAvg: Number(form.monthlySavingAvg),
        existingDebt: Number(form.existingDebt),
        selfReportedCibil: form.selfReportedCibil ? Number(form.selfReportedCibil) : undefined,
        dependents: Number(form.dependents),
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading your profile…
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <SectionHeading
        eyebrow="Step 1"
        title="Your financial profile"
        description="This powers your credit score, savings plans, and every recommendation FinAssist gives you. No bank login required — you tell us, we do the math."
      />

      <MotionCard>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
          <Field label="Full name">
            <input className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.name} onChange={update('name')} />
          </Field>
          <Field label="Employment type">
            <select className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.employmentType} onChange={update('employmentType')}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Average monthly income (₹)" hint="Estimate is fine — irregular income is normal here.">
            <input type="number" className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.monthlyIncomeAvg} onChange={update('monthlyIncomeAvg')} />
          </Field>
          <Field label="Average monthly expense (₹)">
            <input type="number" className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.monthlyExpenseAvg} onChange={update('monthlyExpenseAvg')} />
          </Field>
          <Field label="Average monthly saving (₹)">
            <input type="number" className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.monthlySavingAvg} onChange={update('monthlySavingAvg')} />
          </Field>
          <Field label="Existing debt / EMI outstanding (₹)">
            <input type="number" className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.existingDebt} onChange={update('existingDebt')} />
          </Field>
          <Field label="Self-reported CIBIL score" hint="Optional — skip if you don't know it. FinAssist builds its own score either way.">
            <input type="number" min={300} max={900} className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.selfReportedCibil} onChange={update('selfReportedCibil')} />
          </Field>
          <Field label="Number of dependents">
            <input type="number" className={inputCls} style={{ borderColor: 'var(--border)' }} value={form.dependents} onChange={update('dependents')} />
          </Field>

          {error && (
            <div className="sm:col-span-2 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <div className="sm:col-span-2 flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-transform active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? 'Saving…' : 'Save profile'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--teal)' }}>
                <CheckCircle2 size={16} /> Saved — recalculating your score
              </span>
            )}
          </div>
        </form>
      </MotionCard>

      <MotionCard delay={0.1} className="text-sm text-ink-soft leading-relaxed">
        <p className="text-ink font-medium mb-1">Why we don't pull your real CIBIL score</p>
        <p>
          Credit bureau APIs are only issued to RBI-licensed banks and NBFCs, and real bank
          transaction access requires the Account Aggregator framework with business
          registration. FinAssist instead builds its own transparent, explainable score from
          what you report and log — designed to be a fair proxy where formal credit history
          doesn't exist yet.
        </p>
      </MotionCard>
    </div>
  )
}
