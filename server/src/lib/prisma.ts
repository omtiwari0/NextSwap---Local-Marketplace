import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient across hot reloads in dev to avoid exhausting connections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient(): PrismaClient {
	const log = process.env.NODE_ENV === 'production' ? [] : (['error', 'warn'] as any)
	// Prefer Prisma Accelerate (HTTP/443) if provided
	if (process.env.PRISMA_ACCELERATE_URL) {
		const base = new PrismaClient({ datasourceUrl: process.env.PRISMA_ACCELERATE_URL, log })
		try {
			// @ts-ignore dynamic require to avoid import error if not installed
			const { withAccelerate } = require('@prisma/extension-accelerate')
			// @ts-ignore extend client with accelerate
			return base.$extends(withAccelerate()) as PrismaClient
		} catch {
			// Fallback to base if extension isn't available
			return base
		}
	}
	// Else prefer DIRECT_DATABASE_URL, then DATABASE_URL
	return new PrismaClient({
		log,
		datasources: { db: { url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL } },
	})
}

export const prisma = globalForPrisma.prisma || createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
