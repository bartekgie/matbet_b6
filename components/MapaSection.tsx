'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = {
  navy:     '#1B2D4F',
  red:      '#A8423A',
  textGray: '#6B7280',
}

const S = 20
const ICONS: Record<string, React.ReactElement> = {
  beach:    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3"/><path d="M12 2v1M12 10v1M4.9 4.9l.7.7M17.7 17.3l.7.7M2 7h1M21 7h1M4.9 9.1l.7-.7M18.4 4.9l-.7.7"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>,
  atm:      <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h.01M11 15h2"/></svg>,
  cart:     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  train:    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="16" rx="2"/><path d="M4 10h16"/><path d="M12 2v8"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/><path d="M7 22l2-4M17 22l-2-4"/></svg>,
  plane:    <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>,
  school:   <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  hospital: <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  bus:      <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6M15 6v6M2 12h19.6M18 18h2a1 1 0 0 0 1-1V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  tree:     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L6 11h3L5 19h14L15 11h3L12 2z"/><path d="M12 19v3"/><path d="M10 22h4"/></svg>,
  loop:     <svg width={S} height={S} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
}

const MIEJSCA = [
  { ikona: ICONS.beach,    nazwa: 'Ustka',             odl: '18 km'  },
  { ikona: ICONS.atm,      nazwa: 'Bankomat',           odl: '400 m'  },
  { ikona: ICONS.cart,     nazwa: 'Supermarket',        odl: '400 m'  },
  { ikona: ICONS.train,    nazwa: 'Stacja kolejowa',    odl: '4 km'   },
  { ikona: ICONS.plane,    nazwa: 'Lotnisko',           odl: '120 km' },
  { ikona: ICONS.school,   nazwa: 'Szkoły',             odl: '200 m'  },
  { ikona: ICONS.hospital, nazwa: 'Szpital',            odl: '3,5 km' },
  { ikona: ICONS.bus,      nazwa: 'Przystanek',         odl: '100 m'  },
  { ikona: ICONS.tree,     nazwa: 'Park Zachodni',      odl: '500 m'  },
  { ikona: ICONS.loop,     nazwa: 'Pętla autobusowa',   odl: '900 m'  },
]

const STREET_VIEW_SRC = 'https://www.google.com/maps/embed?pb=!4v1776367986058!6m8!1m7!1sAErv5rsj5UU4tqp3WDf40w!2m2!1d54.46536378406788!2d16.98121339286148!3f295.57545326196043!4f-1.7544951324730391!5f0.7820865974627469'
const GMAPS_URL        = 'https://maps.app.goo.gl/xQP8FjLKFMRYDA2AA'

export default function MapaSection({
  adres,
}: {
  lat?: number
  lng?: number
  adres?: string
}) {
  const gridRef  = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)
  const [mapActive, setMapActive] = useState(false)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const reveal = () => setRevealed(true)
    const rect = grid.getBoundingClientRect()
    if (rect.top < window.innerHeight) { reveal(); return }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { reveal(); io.disconnect() } },
      { threshold: 0, rootMargin: '0px 0px 100px 0px' }
    )
    io.observe(grid)
    const fallback = setTimeout(reveal, 1500)
    return () => { io.disconnect(); clearTimeout(fallback) }
  }, [])

  return (
    <section id="lokalizacja" style={{ background: '#fff', padding: '80px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>

        {/* Label */}
        <p style={{ fontSize: 12, letterSpacing: 2, color: COLORS.red, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          LOKALIZACJA
        </p>

        {/* Adres */}
        {adres && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={COLORS.navy}/>
            </svg>
            <span className="mapa-adres" style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>{adres}</span>
          </div>
        )}

        {/* Ikony odległości — 5 kolumn × 2 rzędy */}
        <div
          ref={gridRef}
          className={`miejsca-grid${revealed ? ' miejsca-revealed' : ''}`}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px 12px', marginBottom: 40 }}
        >
          {MIEJSCA.map(m => (
            <div
              key={m.nazwa}
              className="miejsca-tile"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 8, padding: '16px 10px',
                borderRadius: 10, background: '#f8f9fb', border: '1px solid #eaecf0',
                textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              }}
            >
              <span style={{ flexShrink: 0, color: COLORS.navy, display: 'flex' }}>{m.ikona}</span>
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 11, color: COLORS.textGray, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nazwa}</div>
                <div style={{ fontSize: 14, color: COLORS.navy, fontWeight: 800, marginTop: 2 }}>{m.odl}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Street View — wyśrodkowany */}
        <div
          style={{ maxWidth: 960, margin: '0 auto 24px', position: 'relative' }}
          onMouseLeave={() => setMapActive(false)}
        >
          <iframe
            src={STREET_VIEW_SRC}
            width="100%"
            height="480"
            style={{ border: 0, borderRadius: 16, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {!mapActive && (
            <div
              onClick={() => setMapActive(true)}
              style={{
                position: 'absolute', inset: 0, borderRadius: 16,
                cursor: 'pointer', zIndex: 1,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: 16,
              }}
            >
              <span style={{
                background: 'rgba(0,0,0,0.45)', color: '#fff',
                fontSize: 12, fontWeight: 600, padding: '5px 12px',
                borderRadius: 20, pointerEvents: 'none',
              }}>
                Kliknij, aby eksplorować
              </span>
            </div>
          )}
        </div>

        {/* Przycisk Google Maps */}
        <div style={{ textAlign: 'center' }}>
          <a
            href={GMAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              border: `2px solid ${COLORS.navy}`,
              borderRadius: 25,
              background: 'transparent',
              color: COLORS.navy,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Otwórz w Google Maps →
          </a>
        </div>

      </div>

      <style>{`
        @media (min-width: 769px) {
          .mapa-adres { font-size: 21px !important; }
        }
        .miejsca-tile:hover {
          box-shadow: 0 6px 18px rgba(27,45,79,0.12) !important;
          transform: translateY(-3px) !important;
          border-color: #c5ccd8 !important;
          background: #fff !important;
        }
        @media (max-width: 768px) {
          .miejsca-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 4px !important; margin-bottom: 20px !important; }
          .miejsca-tile {
            gap: 3px !important; padding: 8px 3px !important;
            opacity: 0; transform: translateY(10px);
            transition: opacity 0.35s ease, transform 0.35s ease;
          }
          .miejsca-tile div { font-size: 9px !important; }
          .miejsca-tile div + div { font-size: 11px !important; }
          .miejsca-grid.miejsca-revealed .miejsca-tile { opacity: 1 !important; transform: translateY(0) !important; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(2)  { transition-delay: 0.05s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(3)  { transition-delay: 0.10s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(4)  { transition-delay: 0.15s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(5)  { transition-delay: 0.20s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(6)  { transition-delay: 0.25s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(7)  { transition-delay: 0.30s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(8)  { transition-delay: 0.35s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(9)  { transition-delay: 0.40s; }
          .miejsca-grid.miejsca-revealed .miejsca-tile:nth-child(10) { transition-delay: 0.45s; }
        }
      `}</style>
    </section>
  )
}
