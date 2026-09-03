import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, UserCircle2, Gauge, PiggyBank, TrendingUp, Handshake,
  ShieldCheck, Target, CalendarDays, SlidersHorizontal, MessageCircleHeart, X,
} from 'lucide-react'
import { motion } from 'framer-motion'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/profile', label: 'Financial Profile', icon: UserCircle2 },
  { to: '/credit-score', label: 'Credit Score', icon: Gauge },
  { to: '/emergency-fund', label: 'Emergency Fund Saver', icon: PiggyBank },
  { to: '/investments', label: 'Micro-Investment Advisor', icon: TrendingUp },
  { to: '/p2p-lending', label: 'P2P Lending', icon: Handshake },
  { to: '/insurance', label: 'Insurance Assistant', icon: ShieldCheck },
  { to: '/goals', label: 'Goal Planning', icon: Target },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/simulator', label: 'Expense Simulator', icon: SlidersHorizontal },
  { to: '/chatbot', label: 'Financial Chatbot', icon: MessageCircleHeart },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-50 lg:z-30 top-0 left-0 h-full w-72 shrink-0 flex flex-col
          border-r transition-transform duration-300 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span
              className="grid place-items-center w-9 h-9 rounded-xl font-display font-bold text-base"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            >
              F
            </span>
            <span className="font-display font-semibold text-xl tracking-tight text-ink">
              FinAssist
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-ink-soft hover:text-ink"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'var(--bg-sunken)' : 'transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                      style={{ background: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs text-ink-faint leading-relaxed">
            Built for SDG 1 &amp; SDG 8 — financial inclusion for India's gig
            &amp; informal workforce.
          </p>
        </div>
      </aside>
    </>
  )
}
