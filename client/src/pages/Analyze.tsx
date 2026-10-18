import { useRef, useState } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { analyzeApi, type AnalysisResult, type User } from '../lib/api'
import Layout from '../components/Layout'

export default function Analyze({ user, onCreditsChange }: { user: User; onCreditsChange: (n: number) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const pickFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
  }

  const run = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await analyzeApi.analyze(file)
      setResult(data.result)
      onCreditsChange(user.credits - 1)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout user={user} onLogout={() => {}}>
      <h1 className="text-2xl font-bold">Analyse screenshot</h1>
      <p className="mt-1 text-muted">Upload a virtual football screenshot for AI-powered predictions.</p>

      <div className="mt-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] || null)}
        />
        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="card flex w-full flex-col items-center justify-center gap-3 py-12 hover:border-accent/40 transition"
          >
            <Upload size={32} className="text-muted" />
            <p className="text-sm text-muted">Click to upload a screenshot</p>
            <p className="text-xs text-muted">PNG, JPG up to 10MB</p>
          </button>
        ) : (
          <div className="card">
            <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-lg" />
            <button onClick={() => fileRef.current?.click()} className="mt-3 text-sm text-accent hover:underline">
              Change image
            </button>
          </div>
        )}
      </div>

      {error && <div className="mt-4 rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-sm text-accent">{error}</div>}

      <button onClick={run} disabled={!file || loading || user.credits <= 0} className="btn-accent mt-4">
        {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Analysing…</span> :
         user.credits <= 0 ? 'No credits — buy a package' :
         'Run analysis (1 credit)'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{result.matchInfo}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                result.riskLevel === 'Low' ? 'bg-green-500/10 text-green-400' :
                result.riskLevel === 'High' ? 'bg-accent/10 text-accent' : 'bg-yellow-500/10 text-yellow-400'
              }`}>{result.riskLevel} risk</span>
            </div>
            <p className="mt-2 text-sm text-muted">{result.summary}</p>
          </div>

          <div className="space-y-3">
            {result.predictions?.map((p, i) => (
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
      )}
    </Layout>
  )
}
