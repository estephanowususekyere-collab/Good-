import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Image, CreditCard, ArrowRight } from 'lucide-react'
import { analyzeApi, type Analysis, type User } from '../lib/api'
import Layout from '../components/Layout'

export default function Dashboard({ user }: { user: User }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyzeApi.list().then(({ data }) => setAnalyses(data.analyses)).finally(() => setLoading(false))
  }, [])

  return (
    <Layout user={user} onLogout={() => {}}>
      <h1 className="text-2xl font-bold">Welcome back{user.name ? `, ${user.name}` : ''}</h1>
      <p className="mt-1 text-muted">Here's your Monarch Predictor overview.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="card">
          <TrendingUp className="text-accent" size={20} />
          <p className="mt-2 text-2xl font-bold">{user.credits}</p>
          <p className="text-xs text-muted">Credits remaining</p>
        </div>
        <div className="card">
          <Image className="text-accent" size={20} />
          <p className="mt-2 text-2xl font-bold">{analyses.length}</p>
          <p className="text-xs text-muted">Analyses run</p>
        </div>
        <div className="card col-span-2 sm:col-span-1">
          <CreditCard className="text-accent" size={20} />
          <p className="mt-2 text-sm font-medium">Buy more credits</p>
          <Link to="/packages" className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline">
            View packages <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent analyses</h2>
          <Link to="/analyze" className="text-sm text-accent hover:underline">New analysis</Link>
        </div>

        {loading ? (
          <p className="mt-4 text-muted">Loading…</p>
        ) : analyses.length === 0 ? (
          <div className="card mt-4 text-center">
            <Image size={32} className="mx-auto text-muted" />
            <p className="mt-3 text-muted">No analyses yet. Upload your first virtual football screenshot to get predictions.</p>
            <Link to="/analyze" className="btn-accent mt-4 inline-block max-w-[200px]">Start analysing</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {analyses.slice(0, 5).map((a) => (
              <Link key={a.id} to={`/analysis/${a.id}`} className="card flex items-center gap-4 hover:border-accent/40 transition">
                <img src={a.screenshot} alt="Screenshot" className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{a.result?.matchInfo || 'Virtual Football Match'}</p>
                  <p className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  a.result?.riskLevel === 'Low' ? 'bg-green-500/10 text-green-400' :
                  a.result?.riskLevel === 'High' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-400'
                }`}>{a.result?.riskLevel || 'Medium'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
