import { motion } from 'framer-motion'

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`card p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function MotionCard({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`card p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: 'var(--teal)' }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">{title}</h2>
        {description && <p className="text-sm text-ink-soft mt-1 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, delta, deltaPositive = true, icon: Icon, accent = 'accent', delay = 0 }) {
  return (
    <MotionCard delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        {Icon && (
          <span
            className="grid place-items-center w-9 h-9 rounded-lg"
            style={{ background: `var(--${accent === 'accent' ? 'bg-sunken' : accent + '-soft'})`, color: `var(--${accent})` }}
          >
            <Icon size={17} />
          </span>
        )}
      </div>
      <div className="font-mono-num font-semibold text-2xl sm:text-3xl text-ink">{value}</div>
      {delta && (
        <span
          className="text-xs font-medium w-fit px-2 py-0.5 rounded-full"
          style={{
            color: deltaPositive ? 'var(--teal)' : 'var(--coral)',
            background: deltaPositive ? 'var(--teal-soft)' : 'var(--coral-soft)',
          }}
        >
          {delta}
        </span>
      )}
    </MotionCard>
  )
}

export function ProgressBar({ value, max = 100, color = 'var(--accent)', height = 8 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)', height }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: color, height: '100%', borderRadius: 999 }}
      />
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: 'var(--bg-sunken)', color: 'var(--ink-soft)' },
    good: { bg: 'var(--teal-soft)', color: 'var(--teal)' },
    warn: { bg: 'var(--coral-soft)', color: 'var(--coral)' },
    accent: { bg: 'var(--bg-sunken)', color: 'var(--accent)' },
  }
  const t = tones[tone] || tones.neutral
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={{ background: t.bg, color: t.color }}
    >
      {children}
    </span>
  )
}

export function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
