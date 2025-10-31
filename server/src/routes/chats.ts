import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { getIO } from '../lib/io.js'

const router = Router()

// Start or get an existing chat with the listing's seller
router.post('/start', requireAuth, async (req: any, res: any) => {
  try {
    // Accept either listingId or productId as alias
    const parsed = z.object({ listingId: z.string().min(1).optional(), productId: z.string().min(1).optional() }).parse(req.body || {})
    const listingId = parsed.listingId || parsed.productId
    if (!listingId) return res.status(400).json({ error: 'listingId (or productId) is required' })
    const uid = req.user?.uid as string
  // @ts-ignore prisma typings may be missing in editor
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) return res.status(404).json({ error: 'Listing not found' })
    if (listing.userId === uid) return res.status(400).json({ error: 'Cannot start chat on your own listing' })

    // Find existing chat between buyer (uid) and seller (listing.userId) for this listing
    // @ts-ignore prisma typings may be missing in editor
    // @ts-ignore prisma typings may be missing in editor
    const existing: any = await prisma.chat.findFirst({
      where: {
        AND: [
          { members: { some: { userId: uid } } },
          { members: { some: { userId: listing.userId } } },
          // @ts-ignore prisma typings may be missing in editor
          { listingId: listing.id },
        ],
      },
      // @ts-ignore prisma typings may be missing in editor
      include: { members: { include: { user: true } }, listing: { include: { images: true } } },
    })
    if (existing) {
      const other = (existing.members || []).map((m: any) => m.user).find((u: any) => u.id !== uid)
      const listingPreview = existing.listing ? {
        id: existing.listing.id,
        title: existing.listing.title,
        imageUri: existing.listing.images?.[0]?.url || null,
      } : null
      return res.json({ ok: true, chatId: existing.id, other: other ? { id: other.id, name: other.name, photoUrl: other.photoUrl } : null, listing: listingPreview })
    }

    // @ts-ignore prisma typings may be missing in editor
    // @ts-ignore prisma typings may be missing in editor
    const created: any = await prisma.chat.create({
      data: {
        // @ts-ignore prisma typings may be missing in editor
        listingId: listing.id,
        members: { create: [{ userId: uid }, { userId: listing.userId }] },
      },
      // @ts-ignore prisma typings may be missing in editor
      include: { members: { include: { user: true } }, listing: { include: { images: true } } },
    })
    const other = (created.members || []).map((m: any) => m.user).find((u: any) => u.id !== uid)
    const listingPreview = created.listing ? {
      id: created.listing.id,
      title: created.listing.title,
      imageUri: created.listing.images?.[0]?.url || null,
    } : null
    res.status(201).json({ ok: true, chatId: created.id, other: other ? { id: other.id, name: other.name, photoUrl: other.photoUrl } : null, listing: listingPreview })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

// List current user's chats with last message and counterpart info
router.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    // @ts-ignore prisma typings may be missing in editor
    const chats: any[] = await prisma.chat.findMany({
      where: { members: { some: { userId: uid } } },
      include: {
        members: { include: { user: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        // @ts-ignore prisma typings may be missing in editor
        listing: { include: { images: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute unread counts accurately using lastReadAt with a count query per chat
    const data = await Promise.all(
      chats.map(async (c: any) => {
        const other = (c.members || []).map((m: any) => m.user).find((u: any) => u.id !== uid)
        const meMember = (c.members || []).find((m: any) => m.userId === uid)
        const lastReadAt = meMember?.lastReadAt ? new Date(meMember.lastReadAt) : null

        // @ts-ignore prisma typings may be missing in editor
        const unreadCount = await prisma.message.count({
          where: {
            chatId: c.id,
            senderId: { not: uid },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        })

        return {
          id: c.id,
          other: other ? { id: other.id, name: other.name, photoUrl: other.photoUrl } : null,
          lastMessage: c.messages?.[0]
            ? { id: c.messages[0].id, body: c.messages[0].body, createdAt: c.messages[0].createdAt.toISOString() }
            : null,
          listing: c.listing ? { id: c.listing.id, title: c.listing.title, imageUri: c.listing.images?.[0]?.url || null } : null,
          unreadCount,
        }
      })
    )

    res.json(data)
  } catch (e: any) {
    console.error('GET /chats failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Get chat messages (latest first, simple pagination via cursor optional later)
router.get('/:id/messages', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore prisma typings may be missing in editor
    const membership = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: uid } } })
    if (!membership) return res.status(403).json({ error: 'Forbidden' })

    // Mark as read by updating lastReadAt to now before returning messages
    // @ts-ignore prisma typings may be missing in editor
    await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId: uid } }, data: { lastReadAt: new Date() } })

    // Determine other member's lastReadAt to compute read status for my messages
    // @ts-ignore prisma typings may be missing in editor
    const members: any[] = await prisma.chatMember.findMany({ where: { chatId } })
    const other = (members || []).find((m: any) => m.userId !== uid)
    const otherLastReadAt = other?.lastReadAt ? new Date(other.lastReadAt) : null

    // @ts-ignore prisma typings may be missing in editor
    const messages = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: 'asc' } })
    // emit read receipt update to others
    const io = getIO()
    if (io) io.to(`chat:${chatId}`).emit('chat:read', { chatId, userId: uid, lastReadAt: new Date().toISOString() })
    // compute receiverId per message (1:1 chat)
    const memberIds = (members || []).map((m: any) => m.userId)
    res.json(
      messages.map((m) => {
        const receiverId = memberIds.find((id: string) => id !== m.senderId) || null
        const timestamp = m.createdAt.toISOString()
        return {
          id: m.id,
          senderId: m.senderId,
          receiverId,
          content: m.body,
          timestamp,
          // Back-compat fields
          body: m.body,
          createdAt: timestamp,
          read: otherLastReadAt ? m.createdAt <= otherLastReadAt : false,
        }
      })
    )
  } catch (e: any) {
    console.error('GET /chats/:id/messages failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Send a message
router.post('/:id/messages', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const chatId = req.params.id
    const body = z.object({ body: z.string().min(1).max(2000) }).parse(req.body || {})
  // @ts-ignore prisma typings may be missing in editor
  const isMember = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: uid } } })
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
  // @ts-ignore prisma typings may be missing in editor
  const msg = await prisma.message.create({ data: { chatId, senderId: uid, body: body.body } })
    // compute read (likely false immediately unless other has already lastReadAt in future, edge cases)
    // @ts-ignore prisma typings may be missing in editor
    const members: any[] = await prisma.chatMember.findMany({ where: { chatId } })
    const other = (members || []).find((m: any) => m.userId !== uid)
    const otherLastReadAt = other?.lastReadAt ? new Date(other.lastReadAt) : null
    const receiverId = other?.userId || null
    // emit new message to room
    const io = getIO()
    if (io) io.to(`chat:${chatId}`).emit('message:new', {
      id: msg.id,
      senderId: msg.senderId,
      receiverId,
      content: msg.body,
      timestamp: msg.createdAt.toISOString(),
      // Back-compat
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    })
    res.status(201).json({
      id: msg.id,
      senderId: msg.senderId,
      receiverId,
      content: msg.body,
      timestamp: msg.createdAt.toISOString(),
      // Back-compat
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
      read: otherLastReadAt ? msg.createdAt <= otherLastReadAt : false,
    })
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Bad request' })
  }
})

// Clear chat messages
router.delete('/:id/messages', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore prisma typings may be missing in editor
    const isMember = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: uid } } })
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
    // @ts-ignore prisma typings may be missing in editor
    await prisma.message.deleteMany({ where: { chatId } })
    res.json({ ok: true })
  } catch (e: any) {
    console.error('DELETE /chats/:id/messages failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Deal status for this chat (buyer/seller role + order status)
router.get('/:id/deal', requireAuth, async (req: any, res: any) => {
  try {
    const hasOrder = !!(prisma as any)?.order && typeof (prisma as any).order.findFirst === 'function'
    if (!hasOrder) return res.status(503).json({ error: 'Order model not initialized. Please run: npx prisma generate (and migrate/db push when DB is reachable).' })
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore
    const chat: any = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { listing: { include: { user: true } }, members: true },
    })
    if (!chat) return res.status(404).json({ error: 'Not found' })
    const isMember = (chat.members || []).some((m: any) => m.userId === uid)
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
    const sellerId = chat.listing?.userId
    if (!sellerId) return res.status(400).json({ error: 'Chat not linked to a listing' })
    const role = uid === sellerId ? 'seller' : 'buyer'
    // @ts-ignore
    const order: any = await prisma.order.findFirst({ where: { chatId } })
    const status = order?.status || 'none'
    res.json({ role, status, orderId: order?.id || null })
  } catch (e: any) {
    console.error('GET /chats/:id/deal failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Confirm deal (buyer creates pending; seller confirms → marks listing as sold)
router.post('/:id/deal/confirm', requireAuth, async (req: any, res: any) => {
  try {
    const hasOrder = !!(prisma as any)?.order && typeof (prisma as any).order.findFirst === 'function'
    if (!hasOrder) return res.status(503).json({ error: 'Order model not initialized. Please run: npx prisma generate (and migrate/db push when DB is reachable).' })
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore
    const chat: any = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { listing: true, members: true },
    })
    if (!chat) return res.status(404).json({ error: 'Not found' })
    const isMember = (chat.members || []).some((m: any) => m.userId === uid)
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
    const listing = chat.listing
    if (!listing) return res.status(400).json({ error: 'Chat not linked to a listing' })
    const sellerId = listing.userId
    const buyerId = (chat.members || []).map((m: any) => m.userId).find((id: string) => id !== sellerId)
    const role = uid === sellerId ? 'seller' : 'buyer'

    // @ts-ignore
    let order: any = await prisma.order.findFirst({ where: { chatId } })

    if (role === 'buyer') {
      if (listing.sold) return res.status(400).json({ error: 'Listing already sold' })
      if (!order) {
        // @ts-ignore
        order = await prisma.order.create({
          data: {
            chatId,
            listingId: listing.id,
            buyerId: uid,
            sellerId,
            status: 'pending',
          },
        })
      }
      return res.json({ ok: true, status: order.status, orderId: order.id })
    } else {
      // seller confirmation
      if (!order) return res.status(400).json({ error: 'No pending order to confirm' })
      if (order.status === 'confirmed') return res.json({ ok: true, status: 'confirmed', orderId: order.id })
      // @ts-ignore
      order = await prisma.$transaction(async (tx: any) => {
        // confirm order
        // @ts-ignore
        const o = await tx.order.update({ where: { id: order.id }, data: { status: 'confirmed', confirmedAt: new Date() } })
        // mark listing sold
        // @ts-ignore
        await tx.listing.update({ where: { id: listing.id }, data: { sold: true } })
        return o
      })
      return res.json({ ok: true, status: 'confirmed', orderId: order.id, listingSold: true })
    }
  } catch (e: any) {
    console.error('POST /chats/:id/deal/confirm failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Get chat meta
router.get('/:id', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore prisma typings may be missing in editor
    const chat: any = await prisma.chat.findUnique({
      include: { members: { include: { user: true } }, listing: { include: { images: true, user: true } } },
      where: { id: chatId },
    })
    if (!chat) return res.status(404).json({ error: 'Not found' })
    const isMember = (chat.members || []).some((m: any) => m.userId === uid)
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
    const other = (chat.members || []).map((m: any) => m.user).find((u: any) => u.id !== uid)
    const listing = chat.listing
      ? { id: chat.listing.id, title: chat.listing.title, imageUri: chat.listing.images?.[0]?.url || null, ownerId: chat.listing.userId }
      : null
    res.json({ id: chat.id, other: other ? { id: other.id, name: other.name, photoUrl: other.photoUrl } : null, listing })
  } catch (e: any) {
    console.error('GET /chats/:id failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

// Mark chat as read (update lastReadAt)
router.patch('/:id/read', requireAuth, async (req: any, res: any) => {
  try {
    const uid = req.user?.uid as string
    const chatId = req.params.id
    // @ts-ignore prisma typings may be missing in editor
    const isMember = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: uid } } })
    if (!isMember) return res.status(403).json({ error: 'Forbidden' })
    // @ts-ignore prisma typings may be missing in editor
    await prisma.chatMember.update({ where: { chatId_userId: { chatId, userId: uid } }, data: { lastReadAt: new Date() } })
    res.json({ ok: true })
  } catch (e: any) {
    console.error('PATCH /chats/:id/read failed:', e?.message || e)
    return res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' })
  }
})

export default router
