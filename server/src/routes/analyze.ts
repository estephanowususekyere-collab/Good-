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

  const filePath = req.file.path
  const imageBuffer = fs.readFileSync(filePath)
  const base64Image = imageBuffer.toString('base64')
  const mimeType = req.file.mimetype
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  try {
    const analysis = await runAIAnalysis(dataUrl)

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

async function runAIAnalysis(imageDataUrl: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.startsWith('dev-placeholder')) {
    return mockAnalysis()
  }

  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are an expert virtual football analyst. You analyze screenshots of virtual football matches and provide detailed predictions. Always respond in valid JSON format with the following structure: { "matchInfo": string, "predictions": [ { "market": string, "prediction": string, "confidence": number, "reasoning": string } ], "summary": string, "riskLevel": string }. Confidence is 0-100. RiskLevel is "Low", "Medium", or "High".',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this virtual football screenshot and provide predictions for the likely match outcomes.' },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ],
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content || '{}'
  try {
    return JSON.parse(content)
  } catch {
    return { matchInfo: 'Analysis completed', predictions: [], summary: content, riskLevel: 'Medium' }
  }
}

function mockAnalysis() {
  return {
    matchInfo: 'Virtual Football Match',
    predictions: [
      { market: 'Match Result', prediction: 'Home Win', confidence: 62, reasoning: 'Based on visible team form indicators.' },
      { market: 'Over/Under 2.5', prediction: 'Over 2.5', confidence: 55, reasoning: 'Both teams show attacking tendencies.' },
      { market: 'Both Teams to Score', prediction: 'Yes', confidence: 58, reasoning: 'Defensive vulnerabilities on both sides.' },
    ],
    summary: 'Demo analysis — connect an OpenAI API key for real AI-powered predictions from your screenshots.',
    riskLevel: 'Medium',
  }
}

export default router
