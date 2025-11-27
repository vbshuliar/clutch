import { NextRequest, NextResponse } from 'next/server'
import { generateCode, storeCode, sendVerificationEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase().trim()

    // Validate Essex email
    if (!emailLower.endsWith('@essex.ac.uk')) {
      return NextResponse.json(
        { success: false, error: 'Please use your @essex.ac.uk email address' },
        { status: 400 }
      )
    }

    // Generate and store code
    const code = generateCode()
    await storeCode(emailLower, code)

    // Send email
    const result = await sendVerificationEmail(emailLower, code)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      devMode: result.devMode,
      ...(result.devMode ? { code } : {}),
    })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
