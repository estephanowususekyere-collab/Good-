import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const TOKEN_KEY = 'mp_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface User {
  id: string
  email: string
  name: string | null
  credits: number
}

export interface Package {
  id: string
  name: string
  description: string
  price: number
  credits: number
  popular: boolean
}

export interface Prediction {
  market: string
  prediction: string
  confidence: number
  reasoning: string
}

export interface AnalysisResult {
  matchInfo: string
  predictions: Prediction[]
  summary: string
  riskLevel: string
}

export interface Analysis {
  id: string
  screenshot: string
  result: AnalysisResult
  createdAt: string
}

export const authApi = {
  signup: (email: string, password: string, name?: string) =>
    api.post<{ token: string; user: User }>('/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  me: () => api.get<{ user: User }>('/me'),
}

export const analyzeApi = {
  analyze: (file: File) => {
    const form = new FormData()
    form.append('screenshot', file)
    return api.post<{ id: string; result: AnalysisResult; screenshot: string }>('/analyze', form)
  },
  list: () => api.get<{ analyses: Analysis[] }>('/analyze'),
  get: (id: string) => api.get<{ analysis: Analysis }>(`/analyze/${id}`),
}

export const packagesApi = {
  list: () => api.get<{ packages: Package[] }>('/packages'),
  checkout: (packageId: string) =>
    api.post<{ url?: string; demoMode?: boolean; message?: string }>('/stripe/checkout', { packageId }),
}
