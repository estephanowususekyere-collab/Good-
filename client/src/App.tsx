import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { authApi, getToken, clearToken, type User } from './lib/api'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Analyze from './pages/Analyze'
import Packages from './pages/Packages'
import Account from './pages/Account'
import AnalysisDetail from './pages/AnalysisDetail'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setChecking(false)
      return
    }
    authApi.me()
      .then(({ data }) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    )
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onAuth={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup onAuth={setUser} />} />
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/analyze" element={<Analyze user={user} onCreditsChange={(n) => setUser({ ...user, credits: n })} />} />
            <Route path="/packages" element={<Packages user={user} onCreditsChange={(n) => setUser({ ...user, credits: n })} />} />
            <Route path="/account" element={<Account user={user} />} />
            <Route path="/analysis/:id" element={<AnalysisDetail user={user} />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login onAuth={setUser} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}
