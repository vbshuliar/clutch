import { Resend } from "resend"
import { kv } from "@vercel/kv"

// Check if KV is available
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// In-memory store for development
const memoryStore = new Map<string, { code: string; email: string; expires: number }>()

// Generate 6-digit code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code
export async function storeCode(email: string, code: string): Promise<void> {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  
  if (isKVAvailable()) {
    await kv.set(`verify:${email}`, { code, expires }, { ex: 600 })
  } else {
    memoryStore.set(email, { code, email, expires })
  }
}

// Verify code
export async function verifyCode(email: string, code: string): Promise<boolean> {
  if (isKVAvailable()) {
    const stored = await kv.get<{ code: string; expires: number }>(`verify:${email}`)
    if (!stored) return false
    if (Date.now() > stored.expires) return false
    if (stored.code !== code) return false
    await kv.del(`verify:${email}`)
    return true
  } else {
    const stored = memoryStore.get(email)
    if (!stored) return false
    if (Date.now() > stored.expires) return false
    if (stored.code !== code) return false
    memoryStore.delete(email)
    return true
  }
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; devMode?: boolean }> {
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
  
  if (!resend) {
    console.log('========================================')
    console.log(`DEV MODE - Verification code for ${email}: ${code}`)
    console.log('========================================')
    return { success: true, devMode: true }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Clutch <noreply@clutch-skillshare.app>',
      to: email,
      subject: 'Your Clutch verification code',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #f97316; font-size: 28px; margin-bottom: 24px;">Clutch</h1>
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Your verification code is:
          </p>
          <div style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
            This code will expire in 10 minutes.
          </p>
          <p style="font-size: 14px; color: #6b7280;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      console.log('========================================')
      console.log(`FALLBACK - Verification code for ${email}: ${code}`)
      console.log('========================================')
      return { success: true, devMode: true }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    console.log('========================================')
    console.log(`FALLBACK - Verification code for ${email}: ${code}`)
    console.log('========================================')
    return { success: true, devMode: true }
  }
}
