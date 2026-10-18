import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image, CreditCard, User, LogOut, Crown } from 'lucide-react'
import { clearToken } from '../lib/api'

export default function Layout({ children, user, onLogout }: { children: React.ReactNode; user: any; onLogout: () => void }) {
  const navigate = useNavigate()

  const logout = () => {
    clearToken()
    onLogout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analyze', label: 'Analyze', icon: Image },
    { to: '/packages', label: 'Packages', icon: CreditCard },
    { to: '/account', label: 'Account', icon: User },
  ]

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 border border-white/10">
              <Crown size={18} className="text-accent" />
            </div>
            <span className="font-bold tracking-wider text-white">MONARCH</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-accent">
              {user?.credits ?? 0} credits
            </span>
            <button onClick={logout} className="text-muted hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-1 text-xs text-muted hover:text-white transition">
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
