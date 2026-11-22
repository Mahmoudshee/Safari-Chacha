import { requireAdminSession } from '@/lib/admin-auth'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/admin/login')

  const supabase = createServiceSupabaseClient()

  const [
    { count: bookingCount },
    { count: departureCount },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('departures').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select('id, first_name, surname, email, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return (
    <div>
      <h1 style={{ font: '500 32px var(--font-playfair,Playfair Display),serif', margin: '0 0 8px' }}>
        Welcome back{session.display_name ? `, ${session.display_name}` : ''}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 32px' }}>Shujaa Tours &amp; Adventures · Admin panel</p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 20, marginBottom: 36 }}>
        {[
          { label: 'Total bookings', value: bookingCount ?? 0, color: 'var(--coral)' },
          { label: 'Active departures', value: departureCount ?? 0, color: 'var(--green)' },
          { label: 'Admin role', value: session.role === 'super_admin' ? 'Super admin' : 'Admin', color: 'var(--moss)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid var(--line)', padding: 24, borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>{label}</div>
            <div style={{ font: '500 36px var(--font-playfair,Playfair Display),serif', color, margin: '8px 0 0' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ font: '500 20px var(--font-playfair,Playfair Display),serif', margin: 0 }}>Recent bookings</h2>
          <a href="/admin/bookings" style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 700 }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9f8f5' }}>
              {['Name', 'Email', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recentBookings || []).map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                <td style={{ padding: '12px 16px' }}>{b.first_name} {b.surname}</td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{b.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: b.status === 'confirmed' ? '#e8f7ec' : b.status === 'cancelled' ? '#fef2f2' : '#f1eee5', color: b.status === 'confirmed' ? '#245a38' : b.status === 'cancelled' ? '#a43d2c' : '#78542a' }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11 }}>
                  {new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {(!recentBookings || recentBookings.length === 0) && (
              <tr><td colSpan={4} style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
