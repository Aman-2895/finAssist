import { SignUp } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

function clerkAppearance(isDark) {
  return {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: '#F2A93B',
      colorText: isDark ? '#F2EFE6' : '#17262B',
      colorBackground: isDark ? '#142A30' : '#FFFFFF',
      colorInputBackground: isDark ? '#0E1B20' : '#F7F5EF',
      colorInputText: isDark ? '#F2EFE6' : '#17262B',
      borderRadius: '0.75rem',
      fontFamily: 'Inter, sans-serif',
    },
    elements: {
      card: { boxShadow: 'none', border: 'none' },
      formButtonPrimary: { fontSize: '0.875rem', textTransform: 'none' },
    },
  }
}

export default function Signup() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'var(--bg)' }}>
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--indigo)' }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'var(--accent)' }}
        />
        <div className="relative flex items-center gap-2.5">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl font-display font-bold text-base"
            style={{ background: 'var(--accent)', color: '#17262B' }}
          >
            F
          </span>
          <span className="font-display font-semibold text-xl text-white">FinAssist</span>
        </div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-semibold text-white leading-tight max-w-md"
          >
            Build your first alternative credit score in minutes.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-white/70 mt-4 max-w-sm"
          >
            Create an account, tell us about your income, and FinAssist takes it from there.
          </motion.p>
        </div>

        <p className="relative text-white/50 text-xs">SDG 1 · No Poverty &nbsp;·&nbsp; SDG 8 · Decent Work</p>
      </div>

      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl font-display font-bold text-base"
            style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            F
          </span>
          <span className="font-display font-semibold text-xl text-ink">FinAssist</span>
        </div>

        <SignUp
          routing="virtual"
          signInUrl="/login"
          appearance={clerkAppearance(theme === 'dark')}
        />
      </div>
    </div>
  )
}
