'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { BottomNav } from '@/components/bottom-nav'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  type: string
  tags: string[]
  createdAt: string
}

function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchMyListings = useCallback(async () => {
    if (!user) return
    
    try {
      const res = await fetch(`/api/listings?userId=${user.id}`)
      const data = await res.json()
      
      if (data.success) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMyListings()
  }, [fetchMyListings])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleDeleteListing = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      
      if (data.success) {
        setListings(prev => prev.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Delete listing error:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'skill': return 'bg-orange-100 text-orange-700'
      case 'item': return 'bg-amber-100 text-amber-700'
      case 'need': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'skill': return 'Skill'
      case 'item': return 'Item'
      case 'need': return 'Request'
      default: return category
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="max-w-2xl mx-auto px-4 py-6 bg-white border-b border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-3xl text-white flex-shrink-0 shadow-lg shadow-orange-500/30 font-bold">
            {user?.email?.slice(0, 2).toUpperCase() || '👤'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || 'Student'}</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                ✓ Verified
              </span>
              <span className="text-xs text-gray-400">Essex University</span>
            </div>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto px-4 py-5 bg-white mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{listings.length}</div>
          <div className="text-xs text-gray-500 mt-1">Active Listings</div>
        </div>
      </div>

      {/* My Listings */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">My Listings</h3>
          <Link href="/add" className="text-sm text-orange-500 font-medium">
            + Add New
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-xl">📝</span>
            </div>
            <p className="text-gray-500 text-sm">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 text-sm mb-4">Share what you can offer or what you need!</p>
            <Link
              href="/add"
              className="inline-block py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="font-medium text-gray-900 mb-1">{listing.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteListing(listing.id)}
                    className="p-1.5 hover:bg-red-50 active:scale-90 rounded-lg transition-all ml-2"
                    title="Delete listing"
                  >
                    <span className={`text-xl transition-transform inline-block ${
                      deletingId === listing.id ? 'scale-125 animate-pulse' : ''
                    }`}>
                      {deletingId === listing.id ? '💥' : '🗑️'}
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(listing.category)}`}>
                      {getCategoryLabel(listing.category)}
                    </span>
                    {listing.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Contact shown: <span className="text-gray-600">{user?.email}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
