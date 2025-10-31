import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket() {
  if (socket) return socket
  const token = (useAuthStore.getState() as any).idToken
  if (!token) return null
  socket = io(API, { transports: ['websocket'], auth: { token } })
  socket.on('connect_error', () => {
    // fail silently; HTTP will still work
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
