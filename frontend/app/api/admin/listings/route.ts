import { NextRequest, NextResponse } from 'next/server'
import { db, Listing } from '@/lib/db'
import { getUser } from '@/lib/get-user'

const ADMIN_EMAIL = 'vs22222@essex.ac.uk'

async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  return user?.email === ADMIN_EMAIL
}

export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const listings = await db.getAllListings()
    
    // Sort by date descending
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      listings,
    })
  } catch (error) {
    console.error('Admin get listings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { title, description, category, type, tags, userEmail, userName } = await request.json()

    if (!title || !description || !category || !type || !userEmail || !userName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const listing: Listing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      description,
      category,
      type,
      tags: (tags || []).map((t: string) => t.toLowerCase()),
      createdAt: new Date().toISOString(),
      userId: Buffer.from(userEmail.toLowerCase()).toString('base64'),
      userName,
      userEmail: userEmail.toLowerCase(),
    }

    await db.createListing(listing)

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Admin create listing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}

