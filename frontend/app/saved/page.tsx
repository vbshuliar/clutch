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
  savedAt?: string
}

function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toggleSave, isSaved, refresh } = useSaved()

  const fetchSavedListings = useCallback(async () => {
    try {
      const res = await fetch('/api/saved')
      const data = await res.json()
      
      if (data.success) {
        setListings(data.savedListings || [])
      }
    } catch (error) {
      console.error('Failed to fetch saved listings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSavedListings()
  }, [fetchSavedListings])

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

  const copyEmail = async (listing: Listing) => {
    try {
      await navigator.clipboard.writeText(listing.userEmail)
      setCopiedId(listing.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleUnsave = async (id: string) => {
    await toggleSave(id)
    setListings(prev => prev.filter(l => l.id !== id))
    await refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
          <p className="text-sm text-gray-500 mt-0.5">Listings you bookmarked</p>
        </div>
      </header>

      {/* Listings */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-2xl">❤️</span>
            </div>
            <p className="text-gray-500">Loading saved listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🤍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved listings yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Tap the bookmark icon on any listing to save it here for later
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white flex-shrink-0 font-bold ${
                    listing.category === 'need' 
                      ? 'bg-gradient-to-br from-rose-400 to-orange-400'
                      : 'bg-gradient-to-br from-orange-400 to-amber-400'
                  }`}>
                    {listing.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{listing.userName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
                        <button
                          onClick={() => handleUnsave(listing.id)}
                          className="p-1.5 hover:bg-gray-100 hover:scale-110 active:scale-90 rounded-lg transition-all"
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
                        onClick={() => copyEmail(listing)}
                        className={`py-2 px-4 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 ${
                          copiedId === listing.id
                            ? 'bg-green-500 text-white shadow-green-500/20'
                            : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 active:shadow-md shadow-orange-500/20'
                        }`}
                      >
                        {copiedId === listing.id ? '✓ Copied!' : 'Copy Email'}
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

export default function Saved() {
  return (
    <ProtectedRoute>
      <SavedPage />
    </ProtectedRoute>
  )
}
