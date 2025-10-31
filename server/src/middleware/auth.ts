import jwt from 'jsonwebtoken'

export function requireAuth(req: any, res: any, next: any) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (!payload?.uid) return res.status(401).json({ error: 'Invalid token' })
    req.user = { uid: payload.uid, email: payload.email }
    next()
  } catch (e: any) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
}
