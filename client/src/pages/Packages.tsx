import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Star, Loader2 } from 'lucide-react'
import { packagesApi, type Package, type User } from '../lib/api'
import Layout from '../components/Layout'

export default function Packages({ user, onCreditsChange }: { user: User; onCreditsChange: (n: number) => void }) {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    packagesApi.list().then(({ data }) => setPackages(data.packages)).finally(() => setLoading(false))
    if (searchParams.get('success')) setMessage('Payment successful! Credits added to your account.')
    if (searchParams.get('canceled')) setMessage('')
  }, [searchParams])

  const buy = async (pkg: Package) => {
    setBuying(pkg.id)
    setMessage('')
    try {
      const { data } = await packagesApi.checkout(pkg.id)
      if (data.url) {
        window.location.href = data.url
      } else if (data.demoMode) {
        setMessage(data.message || 'Credits added')
        onCreditsChange(user.credits + pkg.credits)
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Purchase failed')
    } finally {
      setBuying(null)
    }
  }

  return (
    <Layout user={user} onLogout={() => {}}>
      <h1 className="text-2xl font-bold">Packages</h1>
      <p className="mt-1 text-muted">Buy credits to run more analyses.</p>

      {message && (
        <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400">{message}</div>
      )}

      {loading ? (
        <p className="mt-6 text-muted">Loading packages…</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`card relative ${pkg.popular ? 'border-accent/40' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white flex items-center gap-1">
                  <Star size={10} /> POPULAR
                </div>
              )}
              <h3 className="text-lg font-bold">{pkg.name}</h3>
              <p className="mt-1 text-sm text-muted">{pkg.description}</p>
              <p className="mt-4 text-3xl font-bold">${(pkg.price / 100).toFixed(2)}</p>
              <p className="text-sm text-muted">{pkg.credits} analysis credits</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> AI-powered predictions</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Virtual football analysis</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Full match breakdown</li>
              </ul>
              <button onClick={() => buy(pkg)} disabled={buying === pkg.id} className="btn-accent mt-6">
                {buying === pkg.id ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Processing…</span> : `Buy ${pkg.name}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
