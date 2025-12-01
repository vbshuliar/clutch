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

function RequestsPage() {
  const [filter, setFilter] = useState<'all' | 'skill' | 'item'>('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { toggleSave, isSaved } = useSaved()

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings?type=request')
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'skill': return 'Skill'
      case 'item': return 'Item'
      case 'need': return 'Request'
      default: return category
    }
  }

  const openEmail = (listing: Listing) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const listingType = listing.type === 'offer' ? 'Offer' : 'Request'
    const categoryLabel = getCategoryLabel(listing.category)
    
    const subject = encodeURIComponent(`I can help with your ${listing.title}!`)
    const body = encodeURIComponent(
      `Hi ${listing.userName}! 👋\n\n` +
      `I saw your request on Clutch and I think I might be able to help!\n\n` +
      `Here's what you're looking for:\n` +
      `• ${listing.title}\n` +
      `• ${listing.description}\n\n` +
      `I'd love to chat and see how I can assist you. Feel free to let me know what works best for you!\n\n` +
      `Looking forward to connecting!\n\n` +
      `Best wishes,\n\n` +
      `---\n` +
      `Sent via Clutch - Essex University's skill sharing platform`
    )
    
    if (isMobile) {
      // Mobile: Use mailto: which will open Outlook app if installed
      window.location.href = `mailto:${listing.userEmail}?subject=${subject}&body=${body}`
    } else {
      // Desktop: Open Outlook web compose
      const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(listing.userEmail)}&subject=${subject}&body=${body}`
      window.open(outlookUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Students who need help</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search requests..."
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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                filter === f
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:scale-105 active:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : f === 'skill' ? 'Skills' : 'Items'}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
          <p className="text-sm text-orange-800">
            🙋 These students need help! Reach out if you can assist.
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500 text-sm">Be the first to ask for help!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full flex items-center justify-center text-xl text-white flex-shrink-0 font-bold">
                    {listing.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{listing.userName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
                        <button
                          onClick={() => toggleSave(listing.id)}
                          className={`p-1.5 hover:scale-110 active:scale-90 rounded-lg transition-all ${
                            isSaved(listing.id) ? 'hover:bg-gray-100' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`text-xl transition-transform ${isSaved(listing.id) ? 'scale-110' : ''}`}>
                            {isSaved(listing.id) ? '❤️' : '🤍'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <h2 className="font-medium text-gray-900 mb-1">{listing.title}</h2>
                    <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                        Request
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
                        onClick={() => openEmail(listing)}
                        className="py-2 px-4 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 active:shadow-md shadow-orange-500/20"
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

export default function Requests() {
  return (
    <ProtectedRoute>
      <RequestsPage />
    </ProtectedRoute>
  )
}
