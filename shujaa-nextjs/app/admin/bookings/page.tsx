import { requireAdminSession } from '@/lib/admin-auth'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { Booking } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/admin/login')

  const supabase = createServiceSupabaseClient()
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, departures(arrival_date)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 style={{ font: '500 32px var(--font-playfair,Playfair Display),serif', margin: '0 0 24px' }}>Bookings</h1>

      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9f8f5' }}>
              {['Name', 'Email', 'Phone', 'Departure', 'Room', 'Status', 'Created'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(bookings || []).map((b: Booking & { departures?: { arrival_date: string } }) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{b.first_name} {b.surname}</td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{b.email}</td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{b.phone}</td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {b.departures?.arrival_date ? new Date(b.departures.arrival_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11 }}>{b.room_preference}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: b.status === 'confirmed' ? '#e8f7ec' : b.status === 'cancelled' ? '#fef2f2' : '#f1eee5', color: b.status === 'confirmed' ? '#245a38' : b.status === 'cancelled' ? '#a43d2c' : '#78542a' }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {new Date(b.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No bookings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
