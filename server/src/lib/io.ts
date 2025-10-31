import type { Server } from 'socket.io'

let io: Server | null = null

export function setIO(instance: Server) {
  io = instance
}

export function getIO(): Server | null {
  return io
}
