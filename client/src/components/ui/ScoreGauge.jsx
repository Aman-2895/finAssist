import { motion } from 'framer-motion'

// A 270-degree arc gauge, 300–900 range, echoing the CIBIL-style scale
// the report references. Pure SVG, theme-token colors, animates on mount.
export default function ScoreGauge({ score = 742, min = 300, max = 900, size = 220 }) {
  const pct = Math.min(1, Math.max(0, (score - min) / (max - min)))
  const startAngle = -225 // degrees
  const sweep = 270
  const angle = startAngle + sweep * pct

  const r = size / 2 - 18
  const cx = size / 2
  const cy = size / 2

  const polar = (deg) => {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }

  const describeArc = (a0, a1) => {
    const [x0, y0] = polar(a0)
    const [x1, y1] = polar(a1)
    const largeArc = a1 - a0 > 180 ? 1 : 0
    return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`
  }

  const band =
    pct > 0.75 ? { label: 'Excellent', color: 'var(--teal)' } :
    pct > 0.5 ? { label: 'Good', color: 'var(--accent)' } :
    pct > 0.3 ? { label: 'Fair', color: '#E4A83B' } :
    { label: 'Needs work', color: 'var(--coral)' }

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={describeArc(startAngle, startAngle + sweep)}
          fill="none"
          stroke="var(--bg-sunken)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <motion.path
          d={describeArc(startAngle, startAngle + sweep)}
          fill="none"
          stroke={band.color}
          strokeWidth={14}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ pathLength: pct }}
          pathLength={1}
        />
        {/* Needle tip dot */}
        <motion.circle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          cx={polar(angle)[0]}
          cy={polar(angle)[1]}
          r={5}
          fill={band.color}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-mono-num font-bold text-4xl text-ink"
        >
          {score}
        </motion.span>
        <span className="text-xs text-ink-faint mt-1">of {max}</span>
        <span
          className="text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-full"
          style={{ color: band.color, background: 'var(--bg-sunken)' }}
        >
          {band.label}
        </span>
      </div>
    </div>
  )
}
