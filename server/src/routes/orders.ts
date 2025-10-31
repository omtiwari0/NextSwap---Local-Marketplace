import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

// List orders for current user (as buyer or seller)
router.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const hasOrder = !!(prisma as any)?.order && typeof (prisma as any).order.findMany === 'function'
    if (!hasOrder) return res.status(503).json({ error: 'Order model not initialized. Please run: npx prisma generate (and migrate/db push when DB is reachable).' })
    const uid = req.user?.uid as string
    // @ts-ignore
    const orders: any[] = await prisma.order.findMany({
      where: { OR: [{ buyerId: uid }, { sellerId: uid }] },
      include: { listing: { include: { images: true } } },
      orderBy: { createdAt: 'desc' },
    })
    const data = orders.map((o: any) => ({
      id: o.id,
      status: o.status,
      role: o.buyerId === uid ? 'buyer' : 'seller',
      createdAt: o.createdAt.toISOString(),
      listing: o.listing ? { id: o.listing.id, title: o.listing.title, imageUri: o.listing.images?.[0]?.url || null } : null,
    }))
    res.json(data)
  } catch (e: any) {
    console.error('GET /orders failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

export default router
