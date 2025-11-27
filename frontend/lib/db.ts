import { kv } from '@vercel/kv'

// Type definitions
export interface Listing {
  id: string
  title: string
  description: string
  category: string
  type: string
  tags: string[]
  createdAt: string
  userId: string
  userName: string
  userEmail: string
}

// Seed data for initial load
const SEED_DATA: Listing[] = [
  {
    id: 'seed-1',
    title: 'Guitar Lessons',
    description: 'Been playing for 5 years. Can teach basics to intermediate. Looking for Spanish conversation practice or baked goods!',
    category: 'skill',
    type: 'offer',
    tags: ['Music', 'Guitar', 'Teaching'],
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    userId: 'user-1',
    userName: 'Sarah C.',
    userEmail: 'sc21234@essex.ac.uk',
  },
  {
    id: 'seed-2',
    title: 'Homemade Indian Snacks',
    description: 'My mom sent me too many samosas and pakoras! Happy to share. Would love help with physics homework.',
    category: 'item',
    type: 'offer',
    tags: ['Food', 'Snacks', 'Indian'],
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    userId: 'user-2',
    userName: 'Alex K.',
    userEmail: 'ak19876@essex.ac.uk',
  },
  {
    id: 'seed-3',
    title: 'Need French Tutor',
    description: 'Struggling with French 101. Can offer graphic design help or bake you something sweet!',
    category: 'need',
    type: 'request',
    tags: ['French', 'Language', 'Tutoring'],
    createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    userId: 'user-3',
    userName: 'Emma W.',
    userEmail: 'ew20987@essex.ac.uk',
  },
  {
    id: 'seed-4',
    title: 'Car Rides to Campus',
    description: 'I drive to campus every morning around 8am from downtown. Happy to give rides for coffee or study notes!',
    category: 'skill',
    type: 'offer',
    tags: ['Transportation', 'Rides', 'Morning'],
    createdAt: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    userId: 'user-4',
    userName: 'Marcus B.',
    userEmail: 'mb22345@essex.ac.uk',
  },
  {
    id: 'seed-5',
    title: 'Extra Textbooks',
    description: 'Have extra ECON 101 and PSYCH 100 textbooks from last semester. Looking for computer science textbooks or snacks!',
    category: 'item',
    type: 'offer',
    tags: ['Textbooks', 'Books', 'Economics'],
    createdAt: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    userId: 'user-5',
    userName: 'Lily Z.',
    userEmail: 'lz21456@essex.ac.uk',
  },
  {
    id: 'seed-6',
    title: 'Photography for Events',
    description: 'Can take photos for your events or portraits. Would love help with chemistry or some homemade food!',
    category: 'skill',
    type: 'offer',
    tags: ['Photography', 'Events', 'Portraits'],
    createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    userId: 'user-6',
    userName: 'David P.',
    userEmail: 'dp23567@essex.ac.uk',
  },
  {
    id: 'seed-7',
    title: 'Need Laptop Charger (HP)',
    description: 'Lost my HP laptop charger. Can borrow for a day? Will return with cookies or help with your homework!',
    category: 'need',
    type: 'request',
    tags: ['Electronics', 'Urgent', 'Laptop'],
    createdAt: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    userId: 'user-7',
    userName: 'Sophie T.',
    userEmail: 'st20678@essex.ac.uk',
  },
]

// Check if KV is available (has environment variables)
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// In-memory fallback for local development
let memoryListings: Map<string, Listing> = new Map()
let memorySeeded = false

// Initialize memory store with seed data
function initMemory() {
  if (!memorySeeded) {
    SEED_DATA.forEach(item => memoryListings.set(item.id, item))
    memorySeeded = true
  }
}

// Database operations with KV or memory fallback
export const db = {
  async getAllListings(): Promise<Listing[]> {
    if (isKVAvailable()) {
      try {
        const ids = await kv.smembers('listing_ids') as string[]
        if (ids.length === 0) {
          // Seed the database
          await this.seedDatabase()
          return SEED_DATA
        }
        const listings = await Promise.all(
          ids.map(id => kv.hgetall(`listing:${id}`))
        )
        return listings.filter(Boolean) as Listing[]
      } catch (error) {
        console.error('KV getAllListings error:', error)
        initMemory()
        return Array.from(memoryListings.values())
      }
    }
    
    initMemory()
    return Array.from(memoryListings.values())
  },

  async getListing(id: string): Promise<Listing | null> {
    if (isKVAvailable()) {
      try {
        return await kv.hgetall(`listing:${id}`) as Listing | null
      } catch (error) {
        console.error('KV getListing error:', error)
        initMemory()
        return memoryListings.get(id) || null
      }
    }
    
    initMemory()
    return memoryListings.get(id) || null
  },

  async createListing(listing: Listing): Promise<Listing> {
    if (isKVAvailable()) {
      try {
        await kv.hset(`listing:${listing.id}`, listing as Record<string, unknown>)
        await kv.sadd('listing_ids', listing.id)
        return listing
      } catch (error) {
        console.error('KV createListing error:', error)
        initMemory()
        memoryListings.set(listing.id, listing)
        return listing
      }
    }
    
    initMemory()
    memoryListings.set(listing.id, listing)
    return listing
  },

  async deleteListing(id: string): Promise<boolean> {
    if (isKVAvailable()) {
      try {
        await kv.del(`listing:${id}`)
        await kv.srem('listing_ids', id)
        return true
      } catch (error) {
        console.error('KV deleteListing error:', error)
        initMemory()
        return memoryListings.delete(id)
      }
    }
    
    initMemory()
    return memoryListings.delete(id)
  },

  async seedDatabase(): Promise<void> {
    if (isKVAvailable()) {
      try {
        for (const listing of SEED_DATA) {
          await kv.hset(`listing:${listing.id}`, listing as Record<string, unknown>)
          await kv.sadd('listing_ids', listing.id)
        }
      } catch (error) {
        console.error('KV seed error:', error)
      }
    }
  },

  // Saved listings
  async getSavedIds(userId: string): Promise<string[]> {
    if (isKVAvailable()) {
      try {
        return await kv.smembers(`saved:${userId}`) as string[]
      } catch (error) {
        console.error('KV getSavedIds error:', error)
        return []
      }
    }
    return []
  },

  async toggleSaved(userId: string, listingId: string): Promise<boolean> {
    if (isKVAvailable()) {
      try {
        const isSaved = await kv.sismember(`saved:${userId}`, listingId)
        if (isSaved) {
          await kv.srem(`saved:${userId}`, listingId)
          return false
        } else {
          await kv.sadd(`saved:${userId}`, listingId)
          return true
        }
      } catch (error) {
        console.error('KV toggleSaved error:', error)
        return false
      }
    }
    return false
  }
}

