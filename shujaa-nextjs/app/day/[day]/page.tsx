import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDayByNumber, getAllDays, getSiteSettings } from '@/lib/content'
import SiteFooter from '@/components/SiteFooter'
import DayNavProgress from '@/components/DayNavProgress'

export const revalidate = 60

export async function generateStaticParams() {
  return Array.from({ length: 9 }, (_, i) => ({ day: String(i + 1) }))
}

export async function generateMetadata({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day, 10)
  const day = await getDayByNumber(dayNum)
  if (!day) return {}
  return {
    title: `Day ${String(dayNum).padStart(2,'0')} — ${day.title} | Shujaa Tours And Adventures`,
    description: day.subtitle,
  }
}

export default async function DayPage({ params }: { params: { day: string } }) {
  const dayNum = parseInt(params.day, 10)
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 9) notFound()

  const [day, settings] = await Promise.all([
    getDayByNumber(dayNum),
    getSiteSettings(),
  ])
  if (!day) notFound()

  const whatsappNumber = settings.whatsapp_number || '254115119090'
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Shujaa Tours and Adventures, I'd like to ask about the Kenya trip.")}`

  const prevDay = dayNum > 1 ? dayNum - 1 : null
  const nextDay = dayNum < 9 ? dayNum + 1 : null

  const [mainImg, ...subImgs] = day.sub_images_json

  return (
    <>
      {/* Top bar */}
      <div className="top-bar">Shujaa Tours And Adventures · Kenya coast &amp; safari</div>

      {/* Nav */}
      <header className="shell nav-bar">
        <Link href="/" className="brand-logo" style={{ fontSize: 16 }}>
          SHUJAA <em style={{ fontSize: 8, letterSpacing: '0.21em' }}>TOURS AND ADVENTURES</em>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link href="/#itinerary" style={{ fontSize: 11, fontWeight: 700 }}>← Back to full trip</Link>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700 }}>WhatsApp ↗</a>
        </div>
      </header>

      <main className="shell">
        {/* Breadcrumb */}
        <div style={{ padding: '19px 0', color: '#8b9288', fontSize: 10 }}>
          Kenya &nbsp;›&nbsp; Mombasa · Tsavo East · Watamu &nbsp;›&nbsp; <b style={{ color: 'var(--ink)' }}>Day {String(dayNum).padStart(2,'0')}</b>
        </div>

        {/* Progress bar */}
        <DayNavProgress currentDay={dayNum} />

        {/* Headline */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 23 }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--moss)', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {day.location} · Day {String(dayNum).padStart(2,'0')} of 9
            </div>
            <h1 style={{ font: '500 clamp(34px,4vw,52px)/1.05 var(--font-playfair,Playfair Display),serif', letterSpacing: '-1px', margin: '7px 0' }}>
              {day.title}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{day.subtitle}</p>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            <b style={{ color: 'var(--ink)', fontSize: 13 }}>DAY {String(dayNum).padStart(2,'0')} / 09</b><br />
            9 days · small-group journey
          </div>
        </div>

        {/* Hero: photos + story */}
        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 36, alignItems: 'stretch' }}>
          {/* Photos */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 128px', gap: 8, minHeight: 405 }}>
            <img
              src={day.hero_image_url}
              alt={day.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {subImgs.slice(0, 2).map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2 }}
                />
              ))}
            </div>
          </div>

          {/* Story */}
          <div style={{ background: '#f5f1e7', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ font: '500 27px var(--font-playfair,Playfair Display),serif', margin: '0 0 13px' }}>{day.story_heading}</h2>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: '#5e6b62' }}>{day.story_body}</p>

            {/* Videos */}
            {day.videos_json.map((vid, i) => (
              <div key={i} style={{ marginTop: 11, background: '#18352b', color: 'white', padding: '9px 9px 15px' }}>
                {vid.type === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${vid.src}?rel=0`}
                    title={vid.caption}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{ display: 'block', width: '100%', aspectRatio: '16/9', border: 0 }}
                  />
                ) : (
                  <video controls playsInline preload="metadata" poster={vid.poster} style={{ display: 'block', width: '100%', aspectRatio: '16/9' }}>
                    <source src={vid.src} type="video/mp4" />
                  </video>
                )}
                <span style={{ display: 'block', fontSize: 9, color: '#e4e9df', padding: '9px 5px 0', letterSpacing: '0.04em' }}>{vid.caption}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Included / Not included */}
        <section style={{ margin: '30px 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 17 }}>
            <h3 style={{ font: '500 21px var(--font-playfair,Playfair Display),serif', margin: '0 0 12px' }}>Included today</h3>
            <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
              {day.included_items.map((item, i) => (
                <li key={i} style={{ fontSize: 11, color: '#59665c', lineHeight: 1.6, padding: '7px 0', borderBottom: '1px solid #efede6' }}>
                  <span style={{ color: 'var(--moss)', marginRight: 9 }}>✳</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 17 }}>
            <h3 style={{ font: '500 21px var(--font-playfair,Playfair Display),serif', margin: '0 0 12px' }}>Not included / check before travel</h3>
            <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
              {day.not_included_items.map((item, i) => (
                <li key={i} style={{ fontSize: 11, color: '#59665c', lineHeight: 1.6, padding: '7px 0', borderBottom: '1px solid #efede6' }}>
                  <span style={{ color: 'var(--moss)', marginRight: 9 }}>✳</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pager */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', padding: '21px 0', marginTop: 25 }}>
          {prevDay ? (
            <Link href={`/day/${prevDay}`} style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>← Day {String(prevDay).padStart(2,'0')}</Link>
          ) : (
            <span style={{ color: '#aeb3aa', fontSize: 11 }}>← Start of trip</span>
          )}
          <Link href="/#itinerary" style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>All nine days ↑</Link>
          {nextDay ? (
            <Link href={`/day/${nextDay}`} style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>Day {String(nextDay).padStart(2,'0')} →</Link>
          ) : (
            <span style={{ color: '#aeb3aa', fontSize: 11 }}>End of trip →</span>
          )}
        </nav>
      </main>

      <SiteFooter />
    </>
  )
}
