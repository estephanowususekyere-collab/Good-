import { type User } from '../lib/api'
import { Mail, Crown, TrendingUp } from 'lucide-react'
import Layout from '../components/Layout'

export default function Account({ user }: { user: User }) {
  return (
    <Layout user={user} onLogout={() => {}}>
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-1 text-muted">Your profile and subscription details.</p>

      <div className="card mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
            <Crown size={24} className="text-accent" />
          </div>
          <div>
            <p className="font-semibold">{user.name || 'Monarch Player'}</p>
            <p className="text-sm text-muted">Member since {new Date().getFullYear()}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-muted" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-muted" />
            <span className="text-sm">{user.credits} credits remaining</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
