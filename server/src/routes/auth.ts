import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { sendOtpMail } from '../lib/mailer.js'
import rateLimit from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { randomBytes } from 'crypto'

const router = Router()

// Rate limiters for production safety
const startLimiter = rateLimit({ windowMs: 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false })
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })

const gmailOnly = (email: string) => /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)

router.post('/start', startLimiter, async (req: any, res: any) => {
  try {
    const body = z.object({ email: z.string().email(), name: z.string().min(2), phone: z.string().min(6), password: z.string().min(6) }).parse(req.body)
    if (!gmailOnly(body.email)) return res.status(400).json({ error: 'Only Gmail accounts allowed' })

    // Enforce one account per email/phone
    const existingByEmail = await prisma.user.findUnique({ where: { email: body.email } })
    if (existingByEmail) return res.status(409).json({ error: 'An account with this email already exists. Please log in.' })
    const existingByPhone = await prisma.user.findFirst({ where: { phone: body.phone } })
    if (existingByPhone) return res.status(409).json({ error: 'This phone number is already in use.' })

    const code = String(Math.floor(100000 + Math.random() * 900000))
    const codeHash = await argon2.hash(code)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Optional: prevent spamming before last OTP expires
    const recent = await prisma.emailOtp.findFirst({ where: { email: body.email, consumedAt: null }, orderBy: { createdAt: 'desc' } })
    if (recent && recent.expiresAt > new Date()) {
      return res.status(429).json({ error: 'OTP already sent. Please wait before requesting another.' })
    }
    await prisma.emailOtp.create({ data: { email: body.email, codeHash, expiresAt, name: body.name } })

    // Respond immediately; send mail in background so SMTP issues don't block the request.
    res.json({ ok: true, expiresIn: 300 })
    // Fire-and-forget; log failures but do not affect client response
    sendOtpMail(body.email, code).then(() => {
      console.info('OTP email sent to', body.email)
    }).catch((err: any) => {
      console.error('Failed to send OTP email to', body.email, err && err.message ? err.message : err)
    })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

router.post('/verify', async (req: any, res: any) => {
  try {
    const body = z.object({
      email: z.string().email(),
      code: z.string().length(6),
      name: z.string().min(2),
      phone: z.string().min(6),
      password: z.string().min(6),
      photoUrl: z.string().url().optional()
    }).parse(req.body)

    const record = await prisma.emailOtp.findFirst({ where: { email: body.email }, orderBy: { createdAt: 'desc' } })
    if (!record || record.consumedAt || record.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid or expired code' })
    const ok = await argon2.verify(record.codeHash, body.code)
    if (!ok) return res.status(400).json({ error: 'Incorrect code' })

    await prisma.emailOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } })

    // Enforce one account per email/phone: block creation if already exists
    const existsEmail = await prisma.user.findUnique({ where: { email: body.email } })
    if (existsEmail) return res.status(409).json({ error: 'Account already exists for this email. Please log in.' })
    const existsPhone = await prisma.user.findFirst({ where: { phone: body.phone } })
    if (existsPhone) return res.status(409).json({ error: 'This phone number is already in use.' })

    const passwordH = await argon2.hash(body.password)
    const user = await prisma.user.create({
      data: { email: body.email, name: body.name, phone: body.phone, photoUrl: body.photoUrl ?? null, passwordH }
    })

    const token = jwt.sign({ uid: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '30d' })
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, photoUrl: user.photoUrl, createdAt: user.createdAt } })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

router.post('/login', loginLimiter, async (req: any, res: any) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body)
    if (!gmailOnly(body.email)) return res.status(400).json({ error: 'Only Gmail accounts allowed' })
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })
    const ok = await argon2.verify(user.passwordH, body.password)
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ uid: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '30d' })
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, photoUrl: user.photoUrl, createdAt: user.createdAt } })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

export default router

// Update current user profile
router.patch('/me', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    if (!uid) return res.status(401).json({ error: 'Unauthorized' })
    const body = z.object({
      name: z.string().min(2).max(100).optional(),
      phone: z.string().min(6).max(32).optional(),
      photoUrl: z.string().url().optional(),
    }).parse(req.body || {})

    const updated = await prisma.user.update({
      where: { id: uid },
      data: {
        name: body.name ?? undefined,
        phone: body.phone ?? undefined,
        photoUrl: body.photoUrl ?? undefined,
      },
    })

    res.json({ ok: true, user: { id: updated.id, email: updated.email, name: updated.name, phone: updated.phone, photoUrl: updated.photoUrl, createdAt: updated.createdAt } })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

// Get current user profile
router.get('/me', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    if (!uid) return res.status(401).json({ error: 'Unauthorized' })
    const user = await prisma.user.findUnique({ where: { id: uid } })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, photoUrl: user.photoUrl, createdAt: user.createdAt } })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

// Google sign-in: verify Google ID token and upsert user in DB, then issue our JWT
router.post('/google', async (req: any, res: any) => {
  try {
    const body = z.object({ idToken: z.string().min(10) }).parse(req.body || {})
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) return res.status(500).json({ error: 'Server not configured for Google login' })

    // Lazy import to avoid bundling unless used
    const { OAuth2Client } = await import('google-auth-library')
    const client = new OAuth2Client(clientId)
    const ticket = await client.verifyIdToken({ idToken: body.idToken, audience: clientId })
    const payload = ticket.getPayload()
    if (!payload) return res.status(400).json({ error: 'Invalid Google token' })

    const email = payload.email || ''
    const name = payload.name || email.split('@')[0]
    const photoUrl = payload.picture || undefined

    // Optional policy: only allow gmail.com
    if (!/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email)) {
      return res.status(400).json({ error: 'Only Gmail accounts allowed' })
    }

    // Ensure we store a password hash for schema requirements (random, unused for Google auth)
    const randomSecret = randomBytes(24).toString('hex')
    const passwordH = await argon2.hash(randomSecret)

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, photoUrl: photoUrl ?? undefined },
      create: { email, name, phone: '', photoUrl: photoUrl ?? null, passwordH },
    })

    const token = jwt.sign({ uid: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '30d' })
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, photoUrl: user.photoUrl, createdAt: user.createdAt } })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Google auth failed' })
  }
})
