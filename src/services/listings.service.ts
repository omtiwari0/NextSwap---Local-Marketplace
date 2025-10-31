import { fetchData, postData } from './api'
import type { Listing } from '../types'
import { Platform } from 'react-native'
import { useAuthStore } from '../store/authStore'

const API = (globalThis as any)?.process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:4000'

export async function fetchListings(filters?: { category?: string; userId?: string; ids?: string[] }): Promise<Listing[]> {
  const qs = new URLSearchParams()
  if (filters?.category) qs.set('category', filters.category)
  if (filters?.userId) qs.set('userId', filters.userId)
  if (filters?.ids && filters.ids.length) qs.set('ids', filters.ids.join(','))
  const endpoint = `listings${qs.toString() ? `?${qs.toString()}` : ''}`
  const data = await fetchData(endpoint)
  return data as Listing[]
}

export async function createListing(payload: Omit<Listing, 'id' | 'user' | 'createdAt'> & { userId: string }) {
  const token = useAuthStore.getState().idToken
  if (!token) {
    throw new Error('Not authenticated. Please log in to create a listing.')
  }
  // Ensure images are Cloudinary URLs by uploading any local URIs first
  const uploadedImages: { uri: string }[] = []
  for (const img of payload.images || []) {
    const uri = img?.uri
    if (uri && !/^https?:\/\//i.test(uri)) {
      const form = new FormData()
      if (Platform.OS === 'web') {
        const blob = await fetch(uri).then((r) => r.blob())
        // @ts-ignore web FormData supports (Blob, filename)
        form.append('file', blob as any, 'listing.jpg')
      } else {
        // @ts-ignore RN File
        form.append('file', { uri, name: 'listing.jpg', type: 'image/jpeg' } as any)
      }
      const resp = await fetch(`${API}/files/upload`, { method: 'POST', body: form as any })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      uploadedImages.push({ uri: data.secure_url })
    } else if (uri) {
      uploadedImages.push({ uri })
    }
  }

  const body = { ...payload, images: uploadedImages }
  const res = await postData('listings', body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res
}

export async function deleteListing(id: string) {
  const token = useAuthStore.getState().idToken
  if (!token) throw new Error('Not authenticated.')
  const resp = await fetch(`${API}/listings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export async function updateListing(
  id: string,
  payload: Partial<
    Pick<
      Listing,
      'title' | 'category' | 'price' | 'barter' | 'description' | 'condition' | 'originalPrice' | 'location' | 'images'
    >
  >
) {
  const token = useAuthStore.getState().idToken
  if (!token) throw new Error('Not authenticated.')
  let body: any = { ...payload }
  if (payload.images) {
    // Upload local images in parallel; keep existing remote URLs as-is
    const tasks = (payload.images || []).map(async (img) => {
      const uri = img?.uri
      if (!uri) return null
      if (/^https?:\/\//i.test(uri)) return { uri } // already uploaded
      const form = new FormData()
      if (Platform.OS === 'web') {
        const blob = await fetch(uri).then((r) => r.blob())
        // @ts-ignore web FormData supports (Blob, filename)
        form.append('file', blob as any, 'listing.jpg')
      } else {
        // @ts-ignore RN File
        form.append('file', { uri, name: 'listing.jpg', type: 'image/jpeg' } as any)
      }
      const resp = await fetch(`${API}/files/upload`, { method: 'POST', body: form as any })
      if (!resp.ok) throw new Error(await resp.text())
      const data = await resp.json()
      return { uri: data.secure_url as string }
    })
    const uploaded = await Promise.all(tasks)
    body = { ...body, images: uploaded.filter(Boolean) }
  }
  const resp = await fetch(`${API}/listings/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) throw new Error(await resp.text())
  return (await resp.json()) as Listing
}
