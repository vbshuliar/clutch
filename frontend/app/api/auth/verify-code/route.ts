import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/auth'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-in-production'
)

function extractNameFromEmail(email: string): string {
  // Use email username as the name (e.g., vs22222 from vs22222@essex.ac.uk)
  return email.split('@')[0] || ''
}

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase().trim()

    // Verify the code
    const isValid = await verifyCode(emailLower, code)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Create user object
    const user = {
      id: Buffer.from(emailLower).toString('base64'),
      email: emailLower,
      name: extractNameFromEmail(emailLower),
    }

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}

