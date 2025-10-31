const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'
import { useAuthStore } from '../store/authStore'
import type { Order } from '../types'

export async function fetchOrders(): Promise<Order[]> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
