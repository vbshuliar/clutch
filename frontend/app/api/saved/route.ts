import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export async function GET() {
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

    const savedIds = await db.getSavedIds(user.id)
    const allListings = await db.getAllListings()
    const savedListings = allListings.filter(l => savedIds.includes(l.id))

    return NextResponse.json({
      success: true,
      savedListings,
      savedIds,
    })
  } catch (error) {
    console.error('Get saved listings error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch saved listings' },
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

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    const isSaved = await db.toggleSaved(user.id, listingId)

    return NextResponse.json({
      success: true,
      saved: isSaved,
      message: isSaved ? 'Listing saved' : 'Listing removed from saved',
    })
  } catch (error) {
    console.error('Toggle save error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save listing' },
      { status: 500 }
    )
  }
}
