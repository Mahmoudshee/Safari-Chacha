import { requireAdminSession } from '@/lib/admin-auth'
import { getAllDays } from '@/lib/content'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDaysPage() {
  const session = await requireAdminSession()
  if (!session) redirect('/admin/login')

  const days = await getAllDays()

  return (
    <div>
      <h1 style={{ font: '500 32px var(--font-playfair,Playfair Display),serif', margin: '0 0 24px' }}>Itinerary days</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
        {days.map((day) => (
          <div key={day.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
            {day.hero_image_url && (
              <img
                src={day.hero_image_url}
                alt={day.title}
                style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
              />
            )}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--coral)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                Day {String(day.day_number).padStart(2,'0')} · {day.location}
              </div>
              <h3 style={{ font: '500 18px var(--font-playfair,Playfair Display),serif', margin: '0 0 6px' }}>{day.title}</h3>
              <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 14px' }}>{day.subtitle}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link
                  href={`/day/${day.day_number}`}
                  target="_blank"
                  style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textDecoration: 'none' }}
                >
                  View public page ↗
                </Link>
                <span style={{ color: '#ccc' }}>·</span>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                  {day.included_items.length} inclusions
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
        Day content is managed via the Supabase dashboard. Edit the <code>itinerary_days</code> table rows to update text, images, and media.
        Changes appear on the site within 60 seconds (ISR revalidation).
      </p>
    </div>
  )
}
