import { requireAdminSession } from '@/lib/admin-auth'
import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { Departure } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DeparturesPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/admin/login')

  const supabase = createServiceSupabaseClient()
  const { data: departures } = await supabase
    .from('departures')
    .select('*')
    .order('arrival_date', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ font: '500 32px var(--font-playfair,Playfair Display),serif', margin: 0 }}>Departures</h1>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Scheduled Friday departures</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9f8f5' }}>
              {['Arrival date', 'Season', 'Price range', 'Active', 'Notes'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(departures || []).map((d: Departure) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f0ede7' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                  {new Date(d.arrival_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: d.is_high_season ? '#fff4e8' : '#f0f5ef', color: d.is_high_season ? '#8a5200' : '#245a38' }}>
                    {d.is_high_season ? 'High' : 'Standard'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11 }}>
                  {d.price_low && d.price_high ? `€${d.price_low.toLocaleString()}–€${d.price_high.toLocaleString()}` : 'Default pricing'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: d.is_active ? '#245a38' : '#a43d2c', fontWeight: 700, fontSize: 11 }}>
                    {d.is_active ? '✓ Active' : '✗ Hidden'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 11 }}>{d.notes || '—'}</td>
              </tr>
            ))}
            {(!departures || departures.length === 0) && (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>No departures yet. Add them from the Supabase dashboard or run the SQL seed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
