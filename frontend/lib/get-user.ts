import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'default-secret-change-in-production'
)

export interface SessionUser {
  id: string
  email: string
  name: string
}

export async function getUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token.value, secret)

    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

