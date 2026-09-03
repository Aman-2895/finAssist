import { useEffect, useState } from 'react'
import { ShieldCheck, ShieldQuestion, Loader2, AlertCircle } from 'lucide-react'
import { MotionCard, SectionHeading, Badge } from '@/components/ui/Primitives'
import { insuranceApi } from '@/lib/api'

export default function Insurance() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    insuranceApi.myMatches()
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-soft gap-2">
        <Loader2 size={18} className="animate-spin" /> Matching schemes to your profile…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>
        <AlertCircle size={16} /> {error} — did you run <code>npm run seed</code> on the backend?
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Insurance assistant"
        title="Coverage you may be eligible for"
        description="Matched against public government micro-insurance schemes — informational only, not a policy purchase."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {matches.map(({ scheme, eligible, reason }, i) => (
          <MotionCard key={scheme._id} delay={i * 0.06}>
            <div className="flex items-center justify-between mb-3">
              <span
                className="grid place-items-center w-10 h-10 rounded-xl"
                style={{
                  background: eligible ? 'var(--teal-soft)' : 'var(--bg-sunken)',
                  color: eligible ? 'var(--teal)' : 'var(--ink-faint)',
                }}
              >
                {eligible ? <ShieldCheck size={18} /> : <ShieldQuestion size={18} />}
              </span>
              <Badge tone={eligible ? 'good' : 'neutral'}>
                {eligible ? 'Likely eligible' : 'Check eligibility'}
              </Badge>
            </div>
            <h3 className="font-display font-semibold text-lg text-ink">{scheme.name}</h3>
            <p className="text-xs text-ink-faint mb-3">{scheme.fullName}</p>
            <div className="space-y-1.5 text-sm">
              <p className="text-ink-soft">Coverage: <span className="text-ink font-medium">{scheme.coverage}</span></p>
              <p className="text-ink-soft">Premium: <span className="text-ink font-medium">{scheme.premium}</span></p>
            </div>
            <p className="text-xs text-ink-faint mt-3 italic">{reason}</p>
          </MotionCard>
        ))}
      </div>

      <MotionCard delay={0.2} className="text-sm text-ink-soft">
        FinAssist explains eligibility and points you to the official enrolment channel for
        each scheme. Issuing or selling a policy requires IRDAI registration as a corporate
        agent or broker — outside this project's scope.
      </MotionCard>
    </div>
  )
}
