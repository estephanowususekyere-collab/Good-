import { Router } from 'express'
import prisma from '../prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const packages = await prisma.package.findMany({
    orderBy: { price: 'asc' },
  })
  res.json({ packages })
})

export default router
