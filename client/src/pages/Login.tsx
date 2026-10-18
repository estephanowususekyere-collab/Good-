import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, setToken, type User } from '../lib/api'
import Logo from '../components/Logo'

export default function Login({ onAuth }: { onAuth: (user: User) => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(email, password)
      setToken(data.token)
      onAuth(data.user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-8"><Logo size="lg" /></div>

      <div className="w-full max-w-sm">
        <p className="text-center text-xs font-semibold tracking-widest text-accent">WELCOME TO MONARCH PREDICTOR</p>
        <h1 className="mt-2 text-center text-3xl font-bold text-white">Play smarter</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Sign in or create an account to analyse virtual football screenshots and manage your packages.
        </p>

        <form onSubmit={submit} className="card mt-6 space-y-4">
          {error && <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm text-accent">{error}</div>}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-field" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-accent">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot" className="text-accent hover:underline">Forgot password?</Link>
            <Link to="/signup" className="text-accent hover:underline">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
