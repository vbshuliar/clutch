'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/protected-route'
import { BottomNav } from '@/components/bottom-nav'

function AddListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [type, setType] = useState<'offer' | 'request'>('offer')
  const [category, setCategory] = useState<'skill' | 'item'>('skill')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const TITLE_MAX = 50
  const DESC_MAX = 200

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          type,
          tags,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Redirect to the appropriate page
        if (type === 'request') {
          router.push('/requests')
        } else {
          router.push('/')
        }
      } else {
        setError(data.error || 'Failed to create listing')
      }
    } catch (err) {
      console.error('Create listing error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Add Listing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Share what you offer or need</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Your Contact Info Notice */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">📧</span>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 text-sm mb-2">Your contact email</h3>
                <div className="px-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm text-gray-700">
                  {user?.email}
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
                onClick={() => setType('offer')}
                className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  type === 'offer'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="text-3xl mb-2">🎁</div>
                <div className={`text-base font-semibold ${type === 'offer' ? 'text-orange-900' : 'text-gray-700'}`}>
                  Offer
                </div>
                <div className="text-xs text-gray-500 mt-1">I can help or share</div>
              </button>
              <button
                type="button"
                onClick={() => setType('request')}
                className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  type === 'request'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 bg-white hover:border-rose-300'
                }`}
              >
                <div className="text-3xl mb-2">🔍</div>
                <div className={`text-base font-semibold ${type === 'request' ? 'text-rose-900' : 'text-gray-700'}`}>
                  Request
                </div>
                <div className="text-xs text-gray-500 mt-1">I need help</div>
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {type === 'offer' ? 'What are you offering?' : 'What do you need?'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory('skill')}
                className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  category === 'skill'
                    ? type === 'offer' ? 'border-orange-500 bg-orange-50' : 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">🎓</div>
                <div className={`text-base font-semibold ${category === 'skill' ? (type === 'offer' ? 'text-orange-900' : 'text-rose-900') : 'text-gray-700'}`}>
                  Skill
                </div>
                <div className="text-xs text-gray-500 mt-1">{type === 'offer' ? 'Help & services' : 'Need help with'}</div>
              </button>
              <button
                type="button"
                onClick={() => setCategory('item')}
                className={`p-4 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  category === 'item'
                    ? type === 'offer' ? 'border-amber-500 bg-amber-50' : 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">📦</div>
                <div className={`text-base font-semibold ${category === 'item' ? (type === 'offer' ? 'text-amber-900' : 'text-rose-900') : 'text-gray-700'}`}>
                  Item
                </div>
                <div className="text-xs text-gray-500 mt-1">{type === 'offer' ? 'Things to share' : 'Looking for'}</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900">
                Title
              </label>
              <span className={`text-xs ${title.length > TITLE_MAX ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
              placeholder={
                type === 'request'
                  ? 'e.g., Need Math Tutoring Help'
                  : category === 'skill'
                  ? 'e.g., Math Tutoring Available'
                  : 'e.g., Extra Textbooks to Share'
              }
              maxLength={TITLE_MAX}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                Description
              </label>
              <span className={`text-xs ${description.length > DESC_MAX ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
              placeholder={
                type === 'request'
                  ? "Describe what help you need. What can you offer in exchange?"
                  : "Describe what you're offering. What would you like in exchange?"
              }
              maxLength={DESC_MAX}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
            />
            <div className="mt-2 text-xs text-gray-500 flex items-start gap-1">
              <span>⚠️</span>
              <span>No assignment writing or cheating services allowed</span>
            </div>
          </div>

          {/* Tags */}
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-95 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg shadow-orange-500/30 disabled:shadow-none"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Posting...
              </span>
            ) : (
              'Post Listing'
            )}
          </button>
        </form>

      </div>

      <BottomNav />
    </div>
  )
}

export default function AddListing() {
  return (
    <ProtectedRoute>
      <AddListingPage />
    </ProtectedRoute>
  )
}
