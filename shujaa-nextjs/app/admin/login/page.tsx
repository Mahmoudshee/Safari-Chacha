'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f3', display: 'grid', placeItems: 'center', fontFamily: 'DM Sans,sans-serif' }}>
      <div style={{ width: 'min(420px, 90vw)', background: '#fff', border: '1px solid var(--line)', padding: '32px 28px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ font: '700 16px DM Sans,sans-serif', letterSpacing: '0.045em', textTransform: 'uppercase' }}>SHUJAA</div>
          <div style={{ font: '500 9px DM Sans,sans-serif', letterSpacing: '0.23em', color: 'var(--moss)', marginTop: 4 }}>TOURS AND ADVENTURES</div>
        </div>
        <h1 style={{ font: '500 28px var(--font-playfair,Playfair Display),serif', margin: '0 0 20px' }}>Admin login</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
              style={{ width: '100%', height: 45, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box', borderRadius: 2 }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 7 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ width: '100%', height: 45, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box', borderRadius: 2 }}
            />
          </div>
          {error && (
            <div style={{ background: '#fef2f2', color: '#a43d2c', padding: '10px 12px', fontSize: 11, marginBottom: 14, borderRadius: 2 }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '15px 10px' }}
          >
            {loading ? 'SIGNING IN…' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
}
