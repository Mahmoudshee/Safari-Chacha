import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { createServiceSupabaseClient } from './supabase-server'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'shujaa-admin-secret'
)
const COOKIE_NAME = 'shujaa_admin_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createAdminToken(adminId: string, email: string, role: string) {
  return new SignJWT({ adminId, email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { adminId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function getAdminSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export async function requireAdminSession() {
  const session = await getAdminSession()
  if (!session) return null
  // Also verify user still exists in admin_users table
  const supabase = createServiceSupabaseClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, display_name, role')
    .eq('id', session.adminId)
    .single()
  if (!data) return null
  return { ...session, ...data }
}

