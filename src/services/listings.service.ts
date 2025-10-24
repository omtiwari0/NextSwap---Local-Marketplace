import { fetchData, postData } from './api'
import type { Listing } from '../types'

export async function fetchListings(): Promise<Listing[]> {
  try {
    const data = await fetchData('listings')
    return data as Listing[]
  } catch (e) {
    // Fallback mock data if backend not available
    return [
      {
        id: '1',
        title: "Engineering Mathematics Textbook",
        category: 'books',
        price: 450,
        originalPrice: 800,
        condition: 'good',
        barter: true,
        description: 'Semester 3 book, well maintained',
        images: [{ uri: 'https://placehold.co/600x400?text=Book' }],
        user: { id: 'u1', name: 'Rahul Kumar', verified: true },
        location: 'Boys Hostel A',
        createdAt: new Date('2024-10-20').toISOString(),
      },
      {
        id: '2',
        title: 'iPhone 13 Pro',
        category: 'electronics',
        price: 45000,
        condition: 'like-new',
        barter: false,
        description: '10 months old, with box',
        images: [{ uri: 'https://placehold.co/600x400?text=iPhone' }],
        user: { id: 'u2', name: 'Priya Sharma', verified: false },
        location: 'Girls Hostel B',
        createdAt: new Date('2024-10-22').toISOString(),
      },
      {
        id: '3',
        title: 'Dell Laptop i5 10th Gen',
        category: 'electronics',
        price: 32000,
        condition: 'good',
        barter: true,
        description: '8GB RAM, 512GB SSD',
        images: [{ uri: 'https://placehold.co/600x400?text=Laptop' }],
        user: { id: 'u3', name: 'Amit Patel', verified: true },
        location: 'PG Near Gate 2',
        createdAt: new Date('2024-10-21').toISOString(),
      },
      {
        id: '4',
        title: "Levi's Denim Jacket",
        category: 'fashion',
        price: 1200,
        originalPrice: 3500,
        condition: 'like-new',
        barter: true,
        description: 'Size M, rarely worn',
        images: [{ uri: 'https://placehold.co/600x400?text=Jacket' }],
        user: { id: 'u4', name: 'Sneha Reddy', verified: false },
        location: 'Girls Hostel A',
        createdAt: new Date('2024-10-23').toISOString(),
      },
      {
        id: '5',
        title: 'Physics Lab Manual',
        category: 'books',
        price: 200,
        condition: 'fair',
        barter: true,
        description: 'All experiments covered',
        images: [{ uri: 'https://placehold.co/600x400?text=Manual' }],
        user: { id: 'u5', name: 'Vikram Singh', verified: false },
        location: 'Boys Hostel C',
        createdAt: new Date('2024-10-19').toISOString(),
      },
      {
        id: '6',
        title: 'Wireless Mouse Logitech',
        category: 'electronics',
        price: 600,
        condition: 'good',
        barter: false,
        description: 'Battery included',
        images: [{ uri: 'https://placehold.co/600x400?text=Mouse' }],
        user: { id: 'u6', name: 'Anjali Gupta', verified: true },
        location: 'Girls Hostel B',
        createdAt: new Date('2024-10-24').toISOString(),
      },
      {
        id: '7',
        title: 'Nike Running Shoes',
        category: 'fashion',
        price: 2500,
        originalPrice: 5000,
        condition: 'good',
        barter: true,
        description: 'Size 9, barely used',
        images: [{ uri: 'https://placehold.co/600x400?text=Shoes' }],
        user: { id: 'u7', name: 'Karan Mehta', verified: false },
        location: 'Boys Hostel A',
        createdAt: new Date('2024-10-18').toISOString(),
      },
      {
        id: '8',
        title: 'Data Structures Notes',
        category: 'books',
        price: 150,
        condition: 'new',
        barter: true,
        description: 'Complete handwritten notes',
        images: [{ uri: 'https://placehold.co/600x400?text=Notes' }],
        user: { id: 'u8', name: 'Divya Iyer', verified: true },
        location: 'Girls Hostel C',
        createdAt: new Date('2024-10-23').toISOString(),
      },
    ]
  }
}

export async function createListing(payload: Omit<Listing, 'id' | 'user' | 'createdAt'> & { userId: string }) {
  try {
    const res = await postData('listings', payload)
    return res
  } catch (e) {
    // For dev without backend, just echo
    return { id: String(Math.random()), ...payload, createdAt: new Date().toISOString() }
  }
}
