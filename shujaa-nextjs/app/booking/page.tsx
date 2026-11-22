'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

function BookingForm() {
  const params = useSearchParams()
  const date = params.get('date') || ''
  const window_ = params.get('window') || ''
  const price = params.get('price') || ''

  return (
    <>
      <div className="top-bar">Shujaa Tours And Adventures · Kenya coast &amp; safari</div>
      <header className="shell nav-bar">
        <Link href="/" className="brand-logo" style={{ fontSize: 16 }}>
          SHUJAA <em style={{ fontSize: 8 }}>TOURS AND ADVENTURES</em>
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 11, fontWeight: 700 }}>Client login</Link>
          <Link href="/#departures" style={{ fontSize: 11, fontWeight: 700 }}>← Back to dates</Link>
        </div>
      </header>

      <main className="shell-sm" style={{ padding: '42px 5% 70px' }}>
        <div style={{ fontSize: 10, color: 'var(--moss)', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Booking · Step 1 of 2</div>
        <h1 style={{ font: '500 clamp(32px,5vw,46px)/1.1 var(--font-playfair,Playfair Display),serif', margin: '8px 0' }}>Create your Shujaa account</h1>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 630 }}>
          Start with your details as they appear on your passport, then tell us how you prefer to hear from us.
        </p>

        {date && (
          <div style={{ background: '#f1eee5', padding: '15px 18px', margin: '24px 0', fontSize: 12, lineHeight: 1.7 }}>
            Selected arrival: <strong style={{ color: 'var(--green)' }}>{date}</strong> · {window_} · seasonal fare: <strong style={{ color: 'var(--green)' }}>{price}</strong> per person · meet at City Blue Creekside Hotel, Mombasa.
          </div>
        )}

        <form style={{ background: '#fff', border: '1px solid var(--line)', padding: 26 }}>
          <h2 style={{ font: '500 22px var(--font-playfair,Playfair Display),serif', margin: '4px 0 16px' }}>Personal data</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 15 }}>
            {[
              { label: 'First name (as in passport)', name: 'firstName', type: 'text', autoComplete: 'given-name', required: true },
              { label: 'Middle name(s) (as in passport)', name: 'middleName', type: 'text', autoComplete: 'additional-name' },
              { label: 'Surname (as in passport)', name: 'surname', type: 'text', autoComplete: 'family-name', required: true },
              { label: 'Date of birth (as in passport)', name: 'dateOfBirth', type: 'date', required: true },
            ].map((f) => (
              <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700 }}>{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  required={f.required}
                  style={{ height: 43, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', font: '13px DM Sans,sans-serif', borderRadius: 2 }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700 }}>Gender</label>
              <select name="gender" required style={{ height: 43, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', font: '13px DM Sans,sans-serif', borderRadius: 2 }}>
                <option value="">Select</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700 }}>Nationality</label>
              <input name="nationality" autoComplete="country-name" required style={{ height: 43, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', font: '13px DM Sans,sans-serif', borderRadius: 2 }} />
            </div>
          </div>

          <fieldset style={{ border: 0, padding: 0, margin: '20px 0 0' }}>
            <legend style={{ font: '500 22px var(--font-playfair,Playfair Display),serif', margin: '4px 0 16px' }}>Contact information</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 15 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700 }}>Phone number</label>
                <input name="phone" type="tel" autoComplete="tel" required style={{ height: 43, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', font: '13px DM Sans,sans-serif', borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700 }}>Email address</label>
                <input name="email" type="email" autoComplete="email" required style={{ height: 43, border: '1px solid #d9ddd5', padding: '0 11px', background: '#fff', color: 'var(--ink)', font: '13px DM Sans,sans-serif', borderRadius: 2 }} />
              </div>
            </div>
          </fieldset>

          <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, marginTop: 15 }}>
            Please enter your name and date of birth exactly as shown in your passport.<br />
            <strong>Privacy:</strong> Your account is created only after you enter a valid verification code. Passwords are stored as secure hashes by the verification service.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 23 }}>
            <button type="submit" className="btn-primary" style={{ padding: '14px 22px' }}>
              CREATE ACCOUNT AND CONTINUE &nbsp;→
            </button>
          </div>
        </form>
      </main>

      <SiteFooter />
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5vw', textAlign: 'center' }}>Loading…</div>}>
      <BookingForm />
    </Suspense>
  )
}
