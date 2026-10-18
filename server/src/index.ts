import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import prisma from './prisma.js'
import authRoutes from './routes/auth.js'
import analyzeRoutes from './routes/analyze.js'
import packageRoutes from './routes/packages.js'
import stripeRoutes from './routes/stripe.js'

const app = express()
const PORT = process.env.PORT || 4000

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
]
if (process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_PUBLIC_HOST_SUFFIX) {
  allowedOrigins.push(`https://3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`)
}

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(null, true) // permissive in dev; tighten for production
  },
  credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/analyze', analyzeRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/stripe', stripeRoutes)

// Stripe webhook needs raw body — mount before json parser in production
// For dev, the json-parsed body works with constructEvent

app.get('/api/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  const { verifyToken } = await import('./lib/auth.js')
  const payload = verifyToken(header.slice(7))
  if (!payload) return res.status(401).json({ error: 'Invalid token' })
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) return res.status(401).json({ error: 'User not found' })
  res.json({ user: { id: user.id, email: user.email, name: user.name, credits: user.credits } })
})

app.listen(PORT, () => {
  console.log(`Monarch Predictor API running on port ${PORT}`)
})
