'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Login() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { sendCode, user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = await sendCode(email)
    
    if (result.success) {
      // Only show code alert in local development
      if (result.devCode) {
        alert(`🔧 Local Dev Mode\n\nVerification code: ${result.devCode}`)
      }
      router.push('/verify')
    } else {
      setError(result.error || 'Something went wrong')
    }
    
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl animate-pulse">🤝</span>
          </div>
          <div className="text-white text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">CLUTCH</h1>
          <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full">
            <p className="text-white font-medium tracking-wide">SKILL SWAP APP</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-orange-900/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Sign in with your Essex University email
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  University Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@essex.ac.uk"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-orange-500 bg-gray-50 border-gray-300 rounded focus:ring-orange-400 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I understand that my <span className="font-medium text-gray-800">university email will be visible</span> to other Essex students on my listings, allowing them to contact me regarding my offers and requests.
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email || !agreedToTerms}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98] active:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg shadow-orange-500/30"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending code...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Essex Students Only</h3>
                <p className="text-white/80 text-xs leading-relaxed">
                  We verify your identity through your university email to keep our community safe and trusted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center relative z-10">
        <p className="text-white/60 text-xs">
          Exchange skills & help with fellow students
        </p>
      </footer>
    </div>
  )
}
