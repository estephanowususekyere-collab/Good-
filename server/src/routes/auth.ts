import { Router } from 'express'
import prisma from '../prisma.js'
import { hashPassword, verifyPassword, createToken } from '../lib/auth.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  const user = await prisma.user.create({
    data: { email, passwordHash: hashPassword(password), name, credits: 1 },
  })
  const token = createToken(user.id)
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = createToken(user.id)
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, credits: user.credits } })
})

export default router
