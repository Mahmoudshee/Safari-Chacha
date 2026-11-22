'use client'
import Link from 'next/link'

interface SiteHeaderProps {
  barText?: string
  whatsappNumber?: string
  whatsappMessage?: string
}

export default function SiteHeader({
  barText = 'Small groups · local knowledge · journeys made with care',
  whatsappNumber = '254115119090',
  whatsappMessage = "Hello Shujaa Tours and Adventures, I'd like to ask about the Kenya trip.",
}: SiteHeaderProps) {
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <>
      <div className="top-bar">{barText}</div>
      <header className="shell nav-bar">
        <Link href="/" className="brand-logo">
          SHUJAA <em>TOURS AND ADVENTURES</em>
        </Link>
        <nav style={{ display: 'flex', gap: 31, fontSize: 12, fontWeight: 600 }}>
          <Link href="/#experience" style={{ color: 'inherit' }}>Our experiences</Link>
          <Link href="/#itinerary" style={{ color: 'inherit' }}>Itinerary</Link>
          <Link href="/#about" style={{ color: 'inherit' }}>About Shujaa</Link>
        </nav>
        <div style={{ display: 'flex', gap: 19, alignItems: 'center', fontSize: 12 }}>
          <Link href="/#about" style={{ fontWeight: 600 }}>Meet your hosts</Link>
          <Link href="/login">Client login</Link>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            WhatsApp&nbsp; ↗
          </a>
        </div>
      </header>
    </>
  )
}
