import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { analyzeApi, type Analysis, type User } from '../lib/api'
import Layout from '../components/Layout'

export default function AnalysisDetail({ user }: { user: User }) {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) analyzeApi.get(id).then(({ data }) => setAnalysis(data.analysis)).finally(() => setLoading(false))
  }, [id])

  return (
    <Layout user={user} onLogout={() => {}}>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4">
        <ArrowLeft size={16} /> Back
      </Link>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : analysis ? (
        <div className="space-y-4">
          <div className="card">
            <img src={analysis.screenshot} alt="Screenshot" className="mx-auto max-h-80 rounded-lg" />
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{analysis.result?.matchInfo || 'Virtual Football Match'}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                analysis.result?.riskLevel === 'Low' ? 'bg-green-500/10 text-green-400' :
                analysis.result?.riskLevel === 'High' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-400'
              }`}>{analysis.result?.riskLevel || 'Medium'} risk</span>
            </div>
            <p className="mt-2 text-sm text-muted">{analysis.result?.summary}</p>
            <p className="mt-2 text-xs text-muted">{new Date(analysis.createdAt).toLocaleString()}</p>
          </div>
          <div className="space-y-3">
            {analysis.result?.predictions?.map((p, i) => (
              <div key={i} className="card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted">{p.market}</span>
                  <span className="text-sm font-bold text-accent">{p.confidence}% confidence</span>
                </div>
                <p className="mt-1 text-lg font-semibold">{p.prediction}</p>
                <p className="mt-1 text-sm text-muted">{p.reasoning}</p>
                <div className="mt-3 h-1.5 rounded-full bg-surface-2">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-accent to-accent-dark" style={{ width: `${p.confidence}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted">Analysis not found.</p>
      )}
    </Layout>
  )
}
