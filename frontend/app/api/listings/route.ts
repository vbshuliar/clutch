import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, Listing } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    let listings = await db.getAllListings()

    if (type === 'offer') {
      listings = listings.filter(l => l.type === 'offer')
    } else if (type === 'request') {
      listings = listings.filter(l => l.category === 'need')
    }

    if (userId) {
      listings = listings.filter(l => l.userId === userId)
    }

    // Sort by date descending
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      listings,
    })
  } catch (error) {
    console.error('Get listings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('userSession')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    let user
    try {
      user = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { title, description, category, type, tags } = await request.json()

    if (!title || !description || !category || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const listing: Listing = {
      id: `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      description,
      category: type === 'request' ? 'need' : category,
      type,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    }

    await db.createListing(listing)

    return NextResponse.json({
      success: true,
      listing,
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
