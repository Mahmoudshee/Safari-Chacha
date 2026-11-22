import { NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { createAdminToken, setAdminCookie } from '@/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Sign in via Supabase Auth
    const supabase = createServiceSupabaseClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, display_name, role')
      .eq('id', authData.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: 'Access denied: not an admin account' }, { status: 403 })
    }

    const token = await createAdminToken(adminUser.id, adminUser.email, adminUser.role)
    setAdminCookie(token)

    return NextResponse.json({ ok: true, role: adminUser.role, displayName: adminUser.display_name })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
