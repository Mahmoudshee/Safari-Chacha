import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ font: '700 13px DM Sans,sans-serif', letterSpacing: '0.045em', textTransform: 'uppercase', color: '#fff' }}>SHUJAA</div>
          <div style={{ font: '500 8px DM Sans,sans-serif', letterSpacing: '0.23em', color: 'var(--moss)', marginTop: 3 }}>ADMIN PANEL</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            { href: '/admin/dashboard', label: 'Dashboard' },
            { href: '/admin/days', label: 'Itinerary days' },
            { href: '/admin/departures', label: 'Departures' },
            { href: '/admin/bookings', label: 'Bookings' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{ display: 'block', padding: '10px 20px', fontSize: 12, color: '#c8d8c5', fontWeight: 600, borderBottom: '1px solid #1f4336' }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1f4336' }}>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" style={{ background: 'none', border: 0, color: '#c8d8c5', fontSize: 11, cursor: 'pointer', padding: 0 }}>
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <main style={{ flex: 1, background: '#f4f5f3', padding: '32px 36px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
