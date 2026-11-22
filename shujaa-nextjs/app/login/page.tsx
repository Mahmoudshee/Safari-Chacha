'use client'
import { useState } from 'react'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Sign-in could not be completed.')
      }
      window.location.href = '/#departures'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in could not be completed.'
      setStatus(msg.includes('Failed to fetch')
        ? 'Account sign-in is not configured yet. Please contact Shujaa Tours for help.'
        : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="top-bar">Shujaa Tours And Adventures · Kenya coast &amp; safari</div>
      <header className="shell nav-bar">
        <Link href="/" className="brand-logo" style={{ fontSize: 16 }}>
          SHUJAA <em style={{ fontSize: 8 }}>TOURS AND ADVENTURES</em>
        </Link>
        <Link href="/" style={{ fontSize: 11, fontWeight: 700 }}>← Back to website</Link>
      </header>

      <main className="shell-xs" style={{ padding: '56px 5% 76px' }}>
        <div style={{ fontSize: 10, color: 'var(--moss)', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Client account</div>
        <h1 style={{ font: '500 clamp(34px,5vw,48px)/1.1 var(--font-playfair,Playfair Display),serif', margin: '8px 0' }}>Welcome back</h1>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 600 }}>
          Sign in with the email address or phone number you verified when creating your Shujaa account.
        </p>

        <form onSubmit={handleSubmit} style={{ maxWidth: 480, padding: 26, background: '#fff', border: '1px solid var(--line)', marginTop: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700 }}>Email address or phone number</label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              style={{ height: 45, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', fontSize: 13, borderRadius: 2 }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700 }}>Password</label>
            <div style={{ display: 'flex' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ flex: 1, height: 45, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', fontSize: 13, borderRadius: '2px 0 0 2px', minWidth: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ border: '1px solid #d9ddd5', borderLeft: 0, background: '#f7f6f1', color: 'var(--green)', padding: '0 14px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'SIGNING IN…' : 'LOG IN'}
          </button>
          {status && (
            <p style={{ marginTop: 16, padding: 12, background: '#f1eee5', color: '#49594e', fontSize: 11, lineHeight: 1.6 }}>{status}</p>
          )}
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11 }}>
            <a href="https://wa.me/254115119090" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)', fontWeight: 700 }}>Forgot password? Contact us</a>
            <Link href="/booking" style={{ color: 'var(--green)', fontWeight: 700 }}>Create an account</Link>
          </div>
        </form>
      </main>

      <SiteFooter />
    </>
  )
}
