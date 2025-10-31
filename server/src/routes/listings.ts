import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const createSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  price: z.number().int().min(0).max(5000, { message: 'Price cannot exceed ₹5000' }),
  barter: z.boolean().optional().default(false),
  description: z.string().min(1),
  images: z.array(z.object({ uri: z.string().url() })).min(1),
  condition: z.string().optional(),
  originalPrice: z.number().int().min(0).max(5000).optional(),
  location: z.string().optional(),
})

const updateSchema = z
  .object({
    title: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
  price: z.number().int().min(0).max(5000, { message: 'Price cannot exceed ₹5000' }).optional(),
    barter: z.boolean().optional(),
    description: z.string().min(1).optional(),
    condition: z.string().optional(),
  originalPrice: z.number().int().min(0).max(5000).nullable().optional(),
    location: z.string().optional(),
    images: z.array(z.object({ uri: z.string().url() })).min(1).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'No fields to update',
  })

router.get('/', async (req: any, res: any) => {
  try {
    const { category, userId, ids } = req.query as { category?: string; userId?: string; ids?: string }
    const where: any = {}
    if (category) where.category = category
    if (userId) where.userId = userId
    if (ids) {
      const parsed = String(ids)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      if (parsed.length > 0) where.id = { in: parsed }
    }

    // @ts-ignore prisma typing may be unavailable in editor; at runtime this is valid
    const list = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { images: true, user: true },
    })
    const data = list.map((l: any) => ({
      id: l.id,
      title: l.title,
      category: l.category,
      price: l.price,
      barter: l.barter,
      // @ts-ignore sold may not exist in older client typings
      sold: (l as any).sold === true,
      description: l.description,
      images: l.images.map((im: any) => ({ uri: im.url })),
      user: { id: l.userId, name: l.user.name, verified: true },
      createdAt: l.createdAt.toISOString(),
      condition: l.condition ?? undefined,
      originalPrice: l.originalPrice ?? undefined,
      location: l.location ?? undefined,
    }))
    res.json(data)
  } catch (e: any) {
    console.error('GET /listings failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

router.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const body = createSchema.parse(req.body)
    const userId = req.user?.uid as string
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
  // @ts-ignore prisma typing may be unavailable in editor; at runtime this is valid
  const created = await prisma.listing.create({
      data: {
        title: body.title,
        category: body.category,
        price: body.price,
        barter: body.barter ?? false,
        description: body.description,
        condition: body.condition,
        originalPrice: body.originalPrice,
        location: body.location,
        userId,
        images: { create: body.images.map((im) => ({ url: im.uri })) },
      },
      include: { images: true, user: true },
    })
    res.status(201).json({
      id: created.id,
      title: created.title,
      category: created.category,
      price: created.price,
      barter: created.barter,
      // @ts-ignore sold may not exist in older client typings
      sold: (created as any).sold === true,
      description: created.description,
  images: created.images.map((im: any) => ({ uri: im.url })),
      user: { id: created.userId, name: created.user.name, verified: true },
      createdAt: created.createdAt.toISOString(),
      condition: created.condition ?? undefined,
      originalPrice: created.originalPrice ?? undefined,
      location: created.location ?? undefined,
    })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Invalid payload' })
  }
})

// Delete a listing: only the owner can delete. Detach chats and delete images first.
router.delete('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const { id } = req.params as { id: string }
    if (!id) return res.status(400).json({ error: 'Missing id' })
    // @ts-ignore
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (listing.userId !== uid) return res.status(403).json({ error: 'Forbidden' })

    // Best-effort cleanup: remove images, detach chats, then delete listing
    // @ts-ignore
    await prisma.$transaction([
      // @ts-ignore
      prisma.listingImage.deleteMany({ where: { listingId: id } }),
      // @ts-ignore
      prisma.chat.updateMany({ where: { listingId: id }, data: { listingId: null } }),
      // @ts-ignore
      prisma.listing.delete({ where: { id } }),
    ])
    res.json({ ok: true })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Failed to delete' })
  }
})

// Update a listing: only the owner can update. Images are not modified here.
router.patch('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const { id } = req.params as { id: string }
    if (!id) return res.status(400).json({ error: 'Missing id' })

    // @ts-ignore prisma typing may be unavailable in editor; at runtime this is valid
    const listing = await prisma.listing.findUnique({ where: { id }, include: { user: true, images: true } })
    if (!listing) return res.status(404).json({ error: 'Not found' })
    if (listing.userId !== uid) return res.status(403).json({ error: 'Forbidden' })

    const parsed = updateSchema.parse(req.body || {}) as any

    const { images, ...rest } = parsed

    // If images provided, replace them in a transaction for compatibility
    let updated: any
    if (images) {
      // @ts-ignore prisma typing may be unavailable in editor; at runtime this is valid
      updated = await prisma.$transaction(async (tx: any) => {
        // Remove all existing images for this listing
        // @ts-ignore
        await tx.listingImage.deleteMany({ where: { listingId: id } })
        // Update base fields and recreate images
        // @ts-ignore
        const u = await tx.listing.update({
          where: { id },
          data: {
            ...rest,
            images: { create: images.map((im: any) => ({ url: im.uri })) },
          },
          include: { images: true, user: true },
        })
        return u
      })
    } else {
      // @ts-ignore prisma typing may be unavailable in editor; at runtime this is valid
      updated = await prisma.listing.update({
        where: { id },
        data: rest,
        include: { images: true, user: true },
      })
    }

    res.json({
      id: updated.id,
      title: updated.title,
      category: updated.category,
      price: updated.price,
      barter: updated.barter,
      // @ts-ignore sold may not exist in older client typings
      sold: (updated as any).sold === true,
      description: updated.description,
      images: updated.images.map((im: any) => ({ uri: im.url })),
      user: { id: updated.userId, name: updated.user.name, verified: true },
      createdAt: updated.createdAt.toISOString(),
      condition: updated.condition ?? undefined,
      originalPrice: updated.originalPrice ?? undefined,
      location: updated.location ?? undefined,
    })
  } catch (e: any) {
    console.error('PATCH /listings/:id failed', e)
    res.status(400).json({ error: e.message || 'Failed to update' })
  }
})

export default router
