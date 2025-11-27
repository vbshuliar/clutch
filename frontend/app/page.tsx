'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import { BottomNav } from '@/components/bottom-nav'
import { useSaved } from '@/lib/saved-context'

interface Listing {
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

function OffersPage() {
  const [filter, setFilter] = useState<'all' | 'skill' | 'item'>('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { toggleSave, isSaved } = useSaved()

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings?type=offer')
      const data = await res.json()
      
      if (data.success) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

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

  const filteredListings = listings
    .filter(listing => filter === 'all' || listing.category === filter)
    .filter(listing => 
      !searchQuery || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const openEmail = (email: string, title: string) => {
    const subject = encodeURIComponent(`About your Clutch listing: ${title}`)
    const body = encodeURIComponent(`Hi!\n\nI saw your listing "${title}" on Clutch and I'm interested.\n\n`)
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Skills & items from students</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search offers..."
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'skill', 'item'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {f === 'all' ? 'All' : f === 'skill' ? 'Skills' : 'Items'}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">💼</span>
            </div>
            <p className="text-gray-500">Loading offers...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📭</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No offers yet</h3>
            <p className="text-gray-500 text-sm">Be the first to share what you can offer!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-xl text-white flex-shrink-0 font-bold">
                    {listing.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{listing.userName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
                        <button
                          onClick={() => toggleSave(listing.id)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="text-lg">{isSaved(listing.id) ? '🔖' : '📑'}</span>
                        </button>
                      </div>
                    </div>
                    <h2 className="font-medium text-gray-900 mb-1">{listing.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(listing.category)}`}>
                        {getCategoryLabel(listing.category)}
                      </span>
                      {listing.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Contact Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-400">{listing.userEmail}</span>
                      <button
                        onClick={() => openEmail(listing.userEmail, listing.title)}
                        className="py-2 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shadow-orange-500/20"
                      >
                        Email
                      </button>
                    </div>
                  </div>
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

export default function Home() {
  return (
    <ProtectedRoute>
      <OffersPage />
    </ProtectedRoute>
  )
}
