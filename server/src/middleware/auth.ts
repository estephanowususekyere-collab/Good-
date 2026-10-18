import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth.js'
import prisma from '../prisma.js'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const token = header.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }
  req.user = user as any
  next()
}
