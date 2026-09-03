import { Menu, Bell } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

export default function Topbar({ title, subtitle, onMenuClick }) {
  const { theme } = useTheme()

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-ink-soft hover:text-ink shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-xl sm:text-2xl text-ink truncate">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          className="p-2 rounded-full hover:bg-[var(--bg-sunken)] text-ink-soft relative"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--coral)' }}
          />
        </button>
        <ThemeToggle />
        <UserButton
          appearance={{
            baseTheme: theme === 'dark' ? dark : undefined,
            elements: { avatarBox: { width: '36px', height: '36px' } },
          }}
        />
      </div>
    </header>
  )
}
