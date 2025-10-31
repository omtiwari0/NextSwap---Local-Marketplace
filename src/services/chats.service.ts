const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'
import { useAuthStore } from '../store/authStore'

export async function startChat(listingId: string): Promise<{ chatId: string; other?: { id: string; name: string; photoUrl?: string | null } | null; listing?: { id: string; title: string; imageUri?: string | null } | null }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ listingId }) })
  if (!r.ok) throw new Error(await r.text())
  const data = await r.json()
  return { chatId: data.chatId, other: data.other ?? null, listing: data.listing ?? null }
}

export async function fetchChats(): Promise<Array<{ id: string; other: { id: string; name: string; photoUrl?: string | null } | null; lastMessage: { id: string; body: string; createdAt: string } | null; listing?: { id: string; title: string; imageUri?: string | null } | null; unreadCount?: number }>> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function fetchMessages(chatId: string): Promise<Array<{ id: string; body: string; senderId: string; createdAt: string; read?: boolean }>> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function sendMessage(chatId: string, body: string) {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ body }) })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function fetchChatMeta(chatId: string): Promise<{ id: string; other: { id: string; name: string; photoUrl?: string | null } | null; listing: { id: string; title: string; imageUri?: string | null } | null }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function markChatRead(chatId: string): Promise<{ ok: true }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function clearChat(chatId: string): Promise<{ ok: true }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/messages`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function fetchDeal(chatId: string): Promise<{ role: 'buyer' | 'seller'; status: 'none' | 'pending' | 'confirmed'; orderId: string | null }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/deal`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function confirmDeal(chatId: string): Promise<{ ok: true; status: 'pending' | 'confirmed'; orderId: string; listingSold?: boolean }> {
  const token = (useAuthStore.getState() as any).idToken
  if (!token) throw new Error('Not authenticated')
  const r = await fetch(`${API}/chats/${chatId}/deal/confirm`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}
