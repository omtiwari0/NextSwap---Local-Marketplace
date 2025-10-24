import type { Order } from '../types'
import { products } from './products'

// Build a few sample orders from existing products
const byId = Object.fromEntries(products.map(p => [p.id, p]))

export const orders: Order[] = [
  {
    id: 'o1',
    item: byId['2'], // iPhone 13 Pro
    status: 'delivered',
    createdAt: new Date('2024-10-15').toISOString(),
    total: byId['2'].price,
  },
  {
    id: 'o2',
    item: byId['7'], // Nike Running Shoes
    status: 'shipped',
    createdAt: new Date('2024-10-20').toISOString(),
    total: byId['7'].price,
  },
  {
    id: 'o3',
    item: byId['6'], // Wireless Mouse
    status: 'processing',
    createdAt: new Date('2024-10-22').toISOString(),
    total: byId['6'].price,
  },
]
