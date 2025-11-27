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
    userEmail: '',
    userName: '',
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // Auto-generate name from email (use username part)
  const generateNameFromEmail = (email: string): string => {
    const localPart = email.split('@')[0]
    return localPart || ''
  }

  const handleUsernameChange = (username: string) => {
    // Only allow letters and digits
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '')
    setNewListing(prev => ({
      ...prev,
      userEmail: cleanUsername ? `${cleanUsername}@essex.ac.uk` : '',
      userName: cleanUsername
    }))
  }

  const getUsernameFromEmail = (email: string) => {
    return email.split('@')[0] || ''
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
      }
    } catch (error) {
      console.error('Delete error:', error)
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
          tags,
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
          userEmail: '',
          userName: '',
        })
        setTags([])
        setTagInput('')
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
                      <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
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
              {/* User Email */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 text-sm mb-2">User's Essex username</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={getUsernameFromEmail(newListing.userEmail)}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="e.g., ab12345"
                        required
                        className="flex-1 px-4 py-2.5 rounded-xl border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-sm"
                      />
                      <span className="text-orange-700 text-sm font-medium">@essex.ac.uk</span>
                    </div>
                  </div>
                </div>
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
                    className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                      newListing.type === 'offer'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-orange-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎁</div>
                    <div className={`text-base font-semibold ${newListing.type === 'offer' ? 'text-orange-900' : 'text-gray-700'}`}>
                      Offer
                    </div>
                    <div className="text-xs text-gray-500 mt-1">I can help or share</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, type: 'request' })}
                    className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                      newListing.type === 'request'
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🔍</div>
                    <div className={`text-base font-semibold ${newListing.type === 'request' ? 'text-rose-900' : 'text-gray-700'}`}>
                      Request
                    </div>
                    <div className="text-xs text-gray-500 mt-1">I need help</div>
                  </button>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {newListing.type === 'offer' ? 'What are you offering?' : 'What do you need?'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewListing({ ...newListing, category: 'skill' })}
                    className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
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
                    className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
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
                  <label className="block text-sm font-semibold text-gray-900">Title</label>
                  <span className={`text-xs ${newListing.title.length > 50 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {newListing.title.length}/50
                  </span>
                </div>
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value.slice(0, 50) })}
                  placeholder={
                    newListing.type === 'request'
                      ? 'e.g., Need Math Tutoring Help'
                      : newListing.category === 'skill'
                      ? 'e.g., Math Tutoring Available'
                      : 'e.g., Extra Textbooks to Share'
                  }
                  required
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-900">Description</label>
                  <span className={`text-xs ${newListing.description.length > 200 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                    {newListing.description.length}/200
                  </span>
                </div>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value.slice(0, 200) })}
                  placeholder={
                    newListing.type === 'request'
                      ? "Describe what help you need. What can you offer in exchange?"
                      : "Describe what you're offering. What would you like in exchange?"
                  }
                  required
                  maxLength={200}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
                />
                <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
                  <span>⚠️</span>
                  <span>No assignment writing or cheating services allowed</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tags (optional, max 5)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="e.g., math, tutoring, python..."
                    disabled={tags.length >= 5}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="text-orange-500 hover:text-orange-700 hover:scale-125 active:scale-90 transition-all"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newListing.title.trim() || !newListing.description.trim() || !newListing.userEmail.trim() || isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-95 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg shadow-orange-500/30 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Post Listing'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
