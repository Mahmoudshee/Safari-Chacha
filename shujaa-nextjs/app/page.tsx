import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { getHomeContent, getSiteSettings } from '@/lib/content'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import VideoModal from '@/components/VideoModal'
import DepartureCalendar from '@/components/DepartureCalendar'

export const revalidate = 60

export default async function HomePage() {
  const [home, settings] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
  ])

  if (!home) {
    return (
      <div style={{ padding: '10vw', textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <h1>Site coming soon</h1>
        <p>Content is being configured. Please check back shortly.</p>
      </div>
    )
  }

  const waUrl = `https://wa.me/${settings.whatsapp_number || '254115119090'}?text=${encodeURIComponent(settings.whatsapp_message || "Hello Shujaa Tours and Adventures, I'd like to ask about the Kenya trip.")}`

  return (
    <>
      <SiteHeader
        barText={settings.bar_text}
        whatsappNumber={settings.whatsapp_number}
        whatsappMessage={settings.whatsapp_message}
      />

      <main className="shell" id="top">
        {/* Breadcrumb */}
        <div style={{ fontSize: 10, color: '#8a9287', padding: '20px 0' }}>
          Home &nbsp;›&nbsp; Kenya &nbsp;›&nbsp; <span style={{ color: 'var(--ink)' }}>Tsavo Safari &amp; Watamu Coast</span>
        </div>

        {/* Gallery */}
        <div className="gallery-grid" aria-label="Kenya safari and coast photo gallery" style={{ position: 'relative' }}>
          {home.gallery_images_json.map((img, i) => (
            <div
              key={i}
              className={`gphoto${i === 0 ? ' gmain' : ''}`}
              role="img"
              aria-label={img.alt}
              style={{ backgroundImage: `url('${img.url}')` }}
            />
          ))}
          <VideoModal youtubeId={home.video_youtube_id} label="Watch Tsavo East film" />
          <button
            className="photos"
            style={{ position: 'absolute', right: 16, bottom: 15, border: 0, borderRadius: 2, background: '#fff', padding: '10px 13px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            View all photos ↗
          </button>
        </div>

        {/* Jump nav */}
        <div className="jump-nav">
          <a href="#experience">Overview</a>
          <a href="#big-five">Big Five</a>
          <a href="#itinerary">Itinerary</a>
          <a href="#departures">Departure dates</a>
          <a href="#included">What&apos;s included</a>
          <a href="#about">Your hosts</a>
          <a href="#faq">FAQs</a>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 54, padding: '34px 0 70px' }}>
          <article>
            {/* Label + title */}
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>{home.label}</div>
            <h1 style={{ font: '500 clamp(37px,4vw,56px)/1.04 var(--font-playfair,Playfair Display),serif', letterSpacing: '-1.5px', margin: '8px 0 12px' }}>{home.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 22px' }}>{home.subtitle}</p>
            <div style={{ fontSize: 11, color: '#6d776e' }}>
              <span style={{ color: '#dc7855', letterSpacing: 2 }}>★★★★★</span>&nbsp; Designed and hosted by <strong style={{ color: 'var(--ink)' }}>Shujaa Tours And Adventures</strong>
            </div>

            {/* Facts strip */}
            <div className="facts-strip">
              {home.facts_json.map((f, i) => (
                <div key={i} className="fact-item">
                  <small style={{ display: 'block', color: '#8b9288', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 5 }}>{f.label}</small>
                  <strong style={{ fontSize: 12 }}>{f.value}</strong>
                </div>
              ))}
            </div>

            {/* Intro */}
            <div id="experience" style={{ fontSize: 14, lineHeight: 1.9, color: '#56635a', maxWidth: 740 }}>
              <em style={{ color: 'var(--ink)', fontFamily: 'var(--font-playfair,Playfair Display),serif', fontSize: 20, fontStyle: 'italic' }}>
                {home.intro_quote}
              </em>
              <br /><br />
              {home.intro_body}
            </div>

            {/* Big Five */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="big-five">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>Wildlife of the savannah</div>
                  <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: '0 0 0', letterSpacing: '-0.5px' }}>Meet the Big Five</h2>
                </div>
                <small style={{ color: 'var(--muted)', fontSize: 10 }}>Lion · leopard · elephant · rhino · buffalo</small>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 12 }}>
                {home.big_five_json.map((animal, i) => (
                  <figure key={i} style={{ margin: 0, background: '#fff', border: '1px solid var(--line)', overflow: 'hidden' }}>
                    <img
                      src={animal.image}
                      alt={animal.name}
                      loading="lazy"
                      style={{ display: 'block', width: '100%', height: 155, objectFit: 'cover' }}
                    />
                    <figcaption style={{ padding: '11px 12px 13px' }}>
                      <strong style={{ display: 'block', font: '500 18px var(--font-playfair,Playfair Display),serif' }}>{animal.name}</strong>
                      <small style={{ display: 'block', marginTop: 5, color: 'var(--muted)', fontSize: 9, lineHeight: 1.5 }}>{animal.caption}</small>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* What's included */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="included">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>The good stuff, taken care of</div>
                  <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: 0, letterSpacing: '-0.5px' }}>What&apos;s included</h2>
                </div>
                <small style={{ color: 'var(--muted)', fontSize: 10 }}>Thoughtfully planned, from first hello to last game drive.</small>
              </div>
              <div className="inclusions-grid">
                {home.inclusions_json.map((item, i) => (
                  <div key={i} className="include-item">
                    <b style={{ color: 'var(--moss)', fontSize: 15 }}>✳</b>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <h2 style={{ font: '500 23px var(--font-playfair,Playfair Display),serif', margin: 0 }}>Not included</h2>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: '#56635a', maxWidth: 740, marginTop: 10 }}>{home.not_included_text}</p>
            </section>

            {/* Itinerary grid */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="itinerary">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>Nine days in Kenya</div>
                  <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: 0, letterSpacing: '-0.5px' }}>Your journey, day by day</h2>
                </div>
                <small style={{ color: 'var(--muted)', fontSize: 10 }}>Mombasa · Tsavo East · Watamu</small>
              </div>
              <div className="days-grid">
                {[1,2,3,4,5,6,7,8,9].map((day) => (
                  <Link
                    key={day}
                    href={`/day/${day}`}
                    style={{ display: 'block', border: '1px solid var(--line)', background: '#fff', padding: 17, minHeight: 142, color: 'inherit', textDecoration: 'none', position: 'relative', paddingBottom: 30, transition: 'transform 0.2s' }}
                  >
                    <small style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', fontWeight: 800 }}>
                      Day {String(day).padStart(2, '0')} · {['Mombasa','Tsavo East','Tsavo East','Tsavo East','Tsavo to coast','Gede · Marafa','Watamu Blue Safari','Watamu','Mombasa'][day - 1]}
                    </small>
                    <h3 style={{ font: '500 19px var(--font-playfair,Playfair Display),serif', margin: '8px 0' }}>
                      {['Check in & meet','First game drive','A day in the savannah','Searching for the Big Five','One last safari','Village, ruins & sunset','Blue Safari by boat','Beach & island day','Kwahaeri, Kenya'][day - 1]}
                    </h3>
                    <span style={{ position: 'absolute', bottom: 14, fontSize: 10, color: 'var(--coral)', fontWeight: 700 }}>Explore day {day} →</span>
                  </Link>
                ))}
              </div>
              <p style={{ fontSize: 9, color: '#858d82', marginTop: 15 }}>Select a day to see its story, photos, video and what is included.</p>
            </section>

            {/* Departures */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="departures">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>Two group departures each month</div>
                  <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: 0, letterSpacing: '-0.5px' }}>Choose a departure date</h2>
                </div>
                <small style={{ color: 'var(--muted)', fontSize: 10 }}>Two Friday departures each month</small>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: '#56635a', maxWidth: 740 }}>
                Choose one of the two scheduled Friday departures: the first Friday in days 1–9 or the last Friday in the final 9 days of the month.
              </p>
              <DepartureCalendar departures={[]} />
              <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.7, marginTop: 15 }}>
                Prices are per person and follow the current EUR exchange rate. July, August, November and December are high season, with prices up to €2,700; other months start from €2,400.
              </p>
            </section>

            {/* About hosts */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="about">
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>A warm welcome from Kenya</div>
              <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: '0 0 18px', letterSpacing: '-0.5px' }}>Meet the people behind Shujaa</h2>
              <div style={{ background: 'var(--sand)', padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 58, height: 58, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'var(--green)', color: '#fff', font: 'italic 18px var(--font-playfair,Playfair Display),serif' }}>EM · PC</div>
                <div>
                  <h3 style={{ font: '500 22px var(--font-playfair,Playfair Display),serif', margin: '0 0 5px' }}>{home.hosts_name}</h3>
                  <p style={{ fontSize: 11, lineHeight: 1.6, color: '#657268', margin: 0 }}>{home.hosts_bio}</p>
                </div>
              </div>
            </section>

            {/* FAQs */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="faq">
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>A few things to know</div>
              <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: '0 0 18px', letterSpacing: '-0.5px' }}>Before you go</h2>
              <p style={{ fontSize: 14, lineHeight: 1.9, color: '#56635a', maxWidth: 740 }}>{home.faq_text}</p>
            </section>

            {/* Film section */}
            <section style={{ padding: '36px 0', borderTop: '1px solid var(--line)', marginTop: 35 }} id="film">
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--moss)', letterSpacing: '0.17em', textTransform: 'uppercase' }}>Safari &amp; coast film</div>
                  <h2 style={{ font: '500 31px var(--font-playfair,Playfair Display),serif', margin: 0, letterSpacing: '-0.5px' }}>From Tsavo plains to the Indian Ocean</h2>
                </div>
              </div>
              <div style={{ height: 300, background: `linear-gradient(0deg,#0f211a66,#0f211a14),url('${home.gallery_images_json[0]?.url}') center 45%/cover`, display: 'grid', placeItems: 'center', color: 'white', position: 'relative' }}>
                <VideoModal youtubeId={home.video_youtube_id} label="Watch a Tsavo East film" />
              </div>
              <p style={{ fontSize: 9, color: '#858d82', marginTop: 15 }}>
                Video: Tsavo East film by Kenya Wildlife Service. Photos: Jemu Expeditions, Wikimedia Commons, Eden House Cottages, Alpitour and Wikimedia Commons.
              </p>
            </section>
          </article>

          {/* Sidebar booking card */}
          <aside id="book" className="book-card">
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>KENYA · 9 DAYS · TWO DEPARTURES EACH MONTH</div>
            <div style={{ font: '500 29px var(--font-playfair,Playfair Display),serif', margin: '8px 0 2px' }}>
              €{home.price_low.toLocaleString()}–€{home.price_high.toLocaleString()} <small style={{ font: '400 11px DM Sans,sans-serif', color: 'var(--muted)' }}>/ person</small>
            </div>
            <p style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
              Seasonal prices vary by departure. July, August, November and December are high-season months, with prices up to €2,700 per person.
            </p>
            <a className="btn-primary" href="#departures" style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
              CHOOSE A DEPARTURE &nbsp;→
            </a>
            <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
              Euro prices follow the current EUR rate; the local currency equivalent may vary.<br />
              Questions? <a style={{ textDecoration: 'underline', color: 'var(--green)', fontWeight: 700 }} href={waUrl} target="_blank" rel="noopener noreferrer">WhatsApp +254 115 119 090</a><br />
              Reserve for €0. Pay a €200 deposit once the trip is confirmed; instalments available until 31 days before departure.
            </p>
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '17px 0' }} />
            <div style={{ fontSize: 10, color: '#53665a', lineHeight: 2 }}>
              {['Two departure windows every month','Trips confirm at 6 travellers · maximum 15','Small groups with local hosts','Carefully selected stays','Flexible trip planning'].map((perk, i) => (
                <div key={i}><b style={{ color: 'var(--moss)', marginRight: 7 }}>✓</b>{perk}</div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  )
}
