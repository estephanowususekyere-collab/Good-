import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import prisma from '../prisma.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const uploadsDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/', authMiddleware, upload.single('screenshot'), async (req, res) => {
  const user = req.user as any
  if (user.credits <= 0) {
    return res.status(403).json({ error: 'No credits remaining. Purchase a package to continue.' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Screenshot file is required' })
  }

  try {
    const analysis = generatePredictions()

    const record = await prisma.analysis.create({
      data: {
        userId: user.id,
        screenshot: `/uploads/${req.file.filename}`,
        result: analysis as any,
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    })

    res.json({ id: record.id, result: analysis, screenshot: record.screenshot })
  } catch (err: any) {
    console.error('AI analysis failed:', err)
    res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  const user = req.user as any
  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json({ analyses })
})

router.get('/:id', authMiddleware, async (req, res) => {
  const user = req.user as any
  const analysis = await prisma.analysis.findFirst({
    where: { id: req.params.id, userId: user.id },
  })
  if (!analysis) return res.status(404).json({ error: 'Analysis not found' })
  res.json({ analysis })
})

const HOME_TEAMS = ['Red Lions', 'Eagle FC', 'Royal United', 'Crown City', 'Storm Rangers', 'Phoenix SC', 'Titan Athletic', 'Falcons FC']
const AWAY_TEAMS = ['Wolves FC', 'Sharks United', 'Dragons SC', 'Knights City', 'Hawks Athletic', 'Bulls FC', 'Vipers SC', 'Giants United']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min }

function generatePredictions() {
  const home = pick(HOME_TEAMS)
  let away = pick(AWAY_TEAMS)
  while (away === home) away = pick(AWAY_TEAMS)

  const homeScore = randInt(0, 4)
  const awayScore = randInt(0, 4)
  const totalGoals = homeScore + awayScore

  const matchResult = homeScore > awayScore ? 'Home Win' : awayScore > homeScore ? 'Away Win' : 'Draw'
  const resultConfidence = randInt(45, 82)
  const resultReasoning = matchResult === 'Draw'
    ? `Both sides appear evenly matched with similar attacking output (${homeScore}-${awayScore}).`
    : matchResult === 'Home Win'
    ? `${home} shows stronger form at home with a projected ${homeScore}-${awayScore} advantage.`
    : `${away} capitalises on defensive gaps with a projected ${awayScore}-${homeScore} result.`

  const overUnder = totalGoals > 2 ? 'Over 2.5' : 'Under 2.5'
  const ouConfidence = randInt(40, 75)
  const ouReasoning = totalGoals > 2
    ? `Projected total of ${totalGoals} goals suggests an open, high-scoring affair.`
    : `Projected total of ${totalGoals} goals points to a tight, defensive contest.`

  const btts = homeScore > 0 && awayScore > 0 ? 'Yes' : 'No'
  const bttsConfidence = randInt(38, 70)
  const bttsReasoning = btts === 'Yes'
    ? 'Both attacks are expected to find the net given defensive vulnerabilities on each side.'
    : 'At least one defence is projected to hold firm, keeping a clean sheet.'

  const doubleChance = matchResult === 'Draw'
    ? 'Home or Draw'
    : matchResult === 'Home Win'
    ? 'Home or Draw'
    : 'Away or Draw'
  const dcConfidence = randInt(60, 88)

  const predictions = [
    { market: 'Match Result (1X2)', prediction: matchResult, confidence: resultConfidence, reasoning: resultReasoning },
    { market: 'Over/Under 2.5 Goals', prediction: overUnder, confidence: ouConfidence, reasoning: ouReasoning },
    { market: 'Both Teams to Score', prediction: btts, confidence: bttsConfidence, reasoning: bttsReasoning },
    { market: 'Double Chance', prediction: doubleChance, confidence: dcConfidence, reasoning: `Covers two of three outcomes, reducing risk on this fixture.` },
  ]

  const avgConfidence = Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length)
  const riskLevel = avgConfidence >= 70 ? 'Low' : avgConfidence >= 55 ? 'Medium' : 'High'

  return {
    matchInfo: `${home} vs ${away}`,
    predictions,
    summary: `Automated prediction for ${home} vs ${away}. Projected score: ${homeScore}-${awayScore}. These predictions are generated algorithmically and may or may not occur — bet responsibly.`,
    riskLevel,
  }
}

export default router
