import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="relative flex items-center w-16 h-9 rounded-full px-1 transition-colors"
      style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="grid place-items-center w-7 h-7 rounded-full"
        style={{
          background: 'var(--accent)',
          marginLeft: isDark ? 'calc(100% - 1.75rem)' : '0',
        }}
      >
        {isDark ? <Moon size={14} color="var(--accent-ink)" /> : <Sun size={14} color="var(--accent-ink)" />}
      </motion.span>
    </button>
  )
}
