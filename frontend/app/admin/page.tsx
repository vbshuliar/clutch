'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const ADMIN_EMAIL = 'vs22222@essex.ac.uk'

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

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Add listing form
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: 'skill',
    type: 'offer',
    tags: '',
    userEmail: '',
    userName: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Auto-generate name from email (use username part)
  const generateNameFromEmail = (email: string): string => {
    const localPart = email.split('@')[0]
    return localPart || ''
  }

  const handleEmailChange = (email: string) => {
    setNewListing(prev => ({
      ...prev,
      userEmail: email,
      userName: generateNameFromEmail(email)
    }))
  }

  const fetchAllListings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/listings')
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setIsLoadingListings(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      fetchAllListings()
    }
  }, [user, isLoading, router, fetchAllListings])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setListings(prev => prev.filter(l => l.id !== id))
        setMessage('Listing deleted!')
        setTimeout(() => setMessage(''), 2000)
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newListing,
          tags: newListing.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      
      if (data.success) {
        setMessage('Listing created successfully!')
        setNewListing({
          title: '',
          description: '',
          category: 'skill',
          type: 'offer',
          tags: '',
          userEmail: '',
          userName: '',
        })
        fetchAllListings()
        setTimeout(() => setMessage(''), 2000)
      } else {
        setMessage(data.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Create error:', error)
      setMessage('Failed to create listing')
    } finally {
      setIsSubmitting(false)
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'skill': return 'bg-orange-100 text-orange-700'
      case 'item': return 'bg-amber-100 text-amber-700'
      case 'need': return 'bg-rose-100 text-rose-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🔧</span>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🔧 Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage listings</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl text-sm font-medium text-gray-700 transition-all"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              activeTab === 'view'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            📋 All Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              activeTab === 'add'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
            }`}
          >
            ➕ Add New
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-2xl text-sm ${
            message.includes('success') || message.includes('deleted')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* View Tab */}
        {activeTab === 'view' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, tags, email..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />

            {isLoadingListings ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-gray-500">Loading listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings</h3>
                <p className="text-gray-500 text-sm">Database is empty</p>
              </div>
            ) : (
              listings
                .filter(listing => {
                  if (!searchQuery) return true
                  const query = searchQuery.toLowerCase()
                  return (
                    listing.title.toLowerCase().includes(query) ||
                    listing.description.toLowerCase().includes(query) ||
                    listing.userEmail.toLowerCase().includes(query) ||
                    listing.userName.toLowerCase().includes(query) ||
                    listing.tags.some(tag => tag.toLowerCase().includes(query))
                  )
                })
                .map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white flex-shrink-0 font-bold ${
                      listing.type === 'request'
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
                            onClick={() => handleDelete(listing.id)}
                            className="p-1.5 hover:bg-red-50 active:scale-90 rounded-lg transition-all"
                          >
                            <span className={`text-xl transition-transform inline-block ${
                              deletingId === listing.id ? 'scale-125 animate-pulse' : ''
                            }`}>
                              {deletingId === listing.id ? '💥' : '🗑️'}
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{listing.userEmail}</p>
                      <h2 className="font-medium text-gray-900 mb-1">{listing.title}</h2>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          listing.type === 'offer' ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {listing.type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(listing.category)}`}>
                          {listing.category}
                        </span>
                        {listing.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Tab */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <form onSubmit={handleAddListing} className="space-y-5">
              {/* User Info */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl mb-6">
                <p className="text-sm text-orange-800 font-medium">👤 Creating listing on behalf of a user</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">User Email *</label>
                <input
                  type="email"
                  value={newListing.userEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="user@essex.ac.uk"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
                {newListing.userName && (
                  <p className="text-xs text-gray-500 mt-1">Username: {newListing.userName}</p>
                )}
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  What would you like to do?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, type: 'offer' })}
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      newListing.type === 'offer'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎁</div>
                    <div className={`text-base font-semibold ${newListing.type === 'offer' ? 'text-orange-900' : 'text-gray-700'}`}>
                      Offer
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Can help or share</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, type: 'request' })}
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      newListing.type === 'request'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🔍</div>
                    <div className={`text-base font-semibold ${newListing.type === 'request' ? 'text-rose-900' : 'text-gray-700'}`}>
                      Request
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Needs help</div>
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {newListing.type === 'offer' ? 'What are they offering?' : 'What do they need?'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, category: 'skill' })}
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      newListing.category === 'skill'
                        ? newListing.type === 'offer' ? 'border-orange-500 bg-orange-50' : 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎓</div>
                    <div className={`text-base font-semibold ${newListing.category === 'skill' ? (newListing.type === 'offer' ? 'text-orange-900' : 'text-rose-900') : 'text-gray-700'}`}>
                      Skill
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{newListing.type === 'offer' ? 'Help & services' : 'Need help with'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, category: 'item' })}
                    className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      newListing.category === 'item'
                        ? newListing.type === 'offer' ? 'border-amber-500 bg-amber-50' : 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">📦</div>
                    <div className={`text-base font-semibold ${newListing.category === 'item' ? (newListing.type === 'offer' ? 'text-amber-900' : 'text-rose-900') : 'text-gray-700'}`}>
                      Item
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{newListing.type === 'offer' ? 'Things to share' : 'Looking for'}</div>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">Title *</label>
                  <span className="text-xs text-gray-400">{newListing.title.length}/50</span>
                </div>
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value.slice(0, 50) })}
                  placeholder="Listing title"
                  required
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">Description *</label>
                  <span className="text-xs text-gray-400">{newListing.description.length}/200</span>
                </div>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value.slice(0, 200) })}
                  placeholder="Listing description"
                  required
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newListing.tags}
                  onChange={(e) => setNewListing({ ...newListing, tags: e.target.value })}
                  placeholder="Math, Tutoring, Help"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30"
              >
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
