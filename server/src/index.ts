import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import authRoutes from './routes/auth.js'
import filesRoutes from './routes/files.js'
import listingsRoutes from './routes/listings.js'
import chatsRoutes from './routes/chats.js'
import ordersRoutes from './routes/orders.js'
import { prisma } from './lib/prisma.js'
import jwt from 'jsonwebtoken'
import { setIO } from './lib/io.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true }))
app.use(express.json({ limit: '5mb' }))

// Simple root route so hitting '/' isn't blank/404
app.get('/', (_req: any, res: any) => res.type('text/plain').send('NearSwap API is running. Check /health'))
app.get('/health', (_req: any, res: any) => res.json({ ok: true }))
// Simple DB health check (tries to acquire a connection and run SELECT 1)
app.get('/db-health', async (_req: any, res: any) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = await prisma.$queryRaw`SELECT 1` as unknown
		res.json({ ok: true, db: 'up', url: process.env.DIRECT_DATABASE_URL ? 'direct' : 'pooled' })
	} catch (e: any) {
		res.status(503).json({ ok: false, db: 'down', error: e?.message || String(e) })
	}
})
app.use('/auth', authRoutes)
app.use('/files', filesRoutes)
app.use('/listings', listingsRoutes)
app.use('/chats', chatsRoutes)
app.use('/orders', ordersRoutes)

// HTTP server + Socket.IO
const server = http.createServer(app)
const io = new SocketIOServer(server, {
	cors: { origin: process.env.CLIENT_ORIGIN?.split(',') || '*', credentials: true },
})
setIO(io)

io.use((socket, next) => {
	// Accept token via auth or query param
	const token = (socket.handshake.auth as any)?.token || (socket.handshake.query as any)?.token
	if (!token) return next(new Error('Unauthorized'))
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
		;(socket as any).uid = payload.uid || payload.id || payload.sub
		next()
	} catch {
		next(new Error('Unauthorized'))
	}
})

io.on('connection', (socket) => {
	const uid = (socket as any).uid

	socket.on('chat:join', async (chatId: string) => {
		if (!chatId) return
		socket.join(`chat:${chatId}`)
	})

	socket.on('chat:leave', async (chatId: string) => {
		if (!chatId) return
		socket.leave(`chat:${chatId}`)
	})

	// Optional: handle send over socket; routes also support HTTP send
	socket.on('message:send', async (payload: { chatId: string; body: string }) => {
		try {
			const { chatId, body } = payload || ({} as any)
			if (!chatId || !body) return
			// dynamic import to avoid circular
			const { prisma } = await import('./lib/prisma.js')
			// verify membership
			// @ts-ignore
			const membership = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: uid } } })
			if (!membership) return
			// @ts-ignore
			const msg = await prisma.message.create({ data: { chatId, senderId: uid, body } })
			// Determine receiver
			// @ts-ignore
			const members: any[] = await prisma.chatMember.findMany({ where: { chatId } })
			const other = (members || []).find((m: any) => m.userId !== uid)
			const receiverId = other?.userId || null
			// emit to room with enriched payload
			io.to(`chat:${chatId}`).emit('message:new', {
				id: msg.id,
				senderId: msg.senderId,
				receiverId,
				content: msg.body,
				timestamp: msg.createdAt.toISOString(),
				// Back-compat
				body: msg.body,
				createdAt: msg.createdAt.toISOString(),
			})
		} catch {}
	})

	socket.on('disconnect', () => {})
})

const port = process.env.PORT || 4000
server.listen(port, () => console.log(`API on http://localhost:${port}`))

// Graceful logging for uncaught errors to avoid silent exits during development
process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason)
})
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err)
})
