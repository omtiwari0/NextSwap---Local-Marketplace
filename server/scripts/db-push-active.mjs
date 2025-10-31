#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

// Load env from server/.env if present
const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  // Lazy import dotenv only if .env exists
  try {
    const dotenv = await import('dotenv')
    dotenv.config({ path: envPath })
  } catch (err) {
    // ignore if dotenv not installed; environment vars may already be set
  }
}

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
if (!url) {
  console.error('No DIRECT_DATABASE_URL or DATABASE_URL found in environment.')
  process.exit(1)
}

const args = ['prisma', 'db', 'push', '--schema', './prisma/schema.prisma', '--url', url]
const child = spawn(/^win/i.test(process.platform) ? 'npx.cmd' : 'npx', args, {
  stdio: 'inherit',
  shell: true,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
