'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = {
  navy:     '#1B2D4F',
  red:      '#D93025',
  textGray: '#6B7280',
}

const MIEJSCA = [
  { ikona: '🏖️', nazwa: 'Ustka',             odl: '18 km'  },
  { ikona: '🏧', nazwa: 'Bankomat',           odl: '400 m'  },
  { ikona: '🛒', nazwa: 'Supermarket',        odl: '400 m'  },
  { ikona: '🚂', nazwa: 'Stacja kolejowa',    odl: '4 km'   },
  { ikona: '✈️', nazwa: 'Lotnisko',           odl: '120 km' },
  { ikona: '🏫', nazwa: 'Szkoły',             odl: '200 m'  },
  { ikona: '🏥', nazwa: 'Szpital',            odl: '3,5 km' },
  { ikona: '🚌', nazwa: 'Przystanek',         odl: '100 m'  },
  { ikona: '🌳', nazwa: 'Park Zachodni',      odl: '500 m'  },
  { ikona: '🔄', nazwa: 'Pętla autobusowa',   odl: '900 m'  },
]

const STREET_VIEW_SRC = 'https://www.google.com/maps/embed?pb=!4v1776367986058!6m8!1m7!1sAErv5rsj5UU4tqp3WDf40w!2m2!1d54.46536378406788!2d16.98121339286148!3f295.57545326196043!4f-1.7544951324730391!5f0.7820865974627469'

export default function MapaSection({
  lat,
  lng,
  adres,
}: {
  lat?: number
  lng?: number
  adres?: string
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid || window.innerWidth > 768) return
    const reveal = () => setRevealed(true)
    // Jeśli sekcja już widoczna przy montażu — od razu odkryj
    const rect = grid.getBoundingClientRect()
    if (rect.top < window.innerHeight) { reveal(); return }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { reveal(); io.disconnect() } },
      { threshold: 0 }
    )
    io.observe(grid)
    return () => io.disconnect()
  }, [])

  return (
    <section id="lokalizacja" style={{ background: '#fff', padding: '100px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div className="mapa-grid" style={{ display: 'grid', gridTemplateColumns: '40% 1fr', gap: 56, alignItems: 'flex-start' }}>

          {/* ── Lewa kolumna ──────────────────────────────────── */}
          <div>
            <p style={{ fontSize: 12, letterSpacing: 2, color: COLORS.red, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
              LOKALIZACJA
            </p>
            {adres && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={COLORS.navy}/>
                </svg>
                <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.navy }}>{adres}</span>
              </div>
            )}

            {/* Odległości — 2 kolumny */}
            <div ref={gridRef} className={`miejsca-grid${revealed ? ' miejsca-revealed' : ''}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 32 }}>
              {MIEJSCA.map(m => (
                <div key={m.nazwa} className="miejsca-tile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#f8f9fb', border: '1px solid #eaecf0' }}>
                  <span className="miejsca-emoji" style={{ fontSize: 18, flexShrink: 0 }}>{m.ikona}</span>
                  <div className="miejsca-info" style={{ flex: 1, minWidth: 0 }}>
                    <div className="miejsca-name" style={{ fontSize: 12, color: COLORS.textGray, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nazwa}</div>
                    <div className="miejsca-dist" style={{ fontSize: 14, color: COLORS.navy, fontWeight: 800 }}>{m.odl}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://maps.app.goo.gl/18VAFkZofywjL8g69"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
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

          {/* ── Prawa kolumna — Street View ───────────────────── */}
          <div>
            <iframe
              src={STREET_VIEW_SRC}
              width="100%"
              height="500"
              style={{ border: 0, borderRadius: 16, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 769px) and (max-width: 900px) {
          .mapa-grid { grid-template-columns: 1fr !important; }
          .miejsca-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .mapa-grid { grid-template-columns: 1fr !important; }
          .miejsca-grid { grid-template-columns: repeat(5, 1fr) !important; gap: 4px !important; margin-bottom: 20px !important; }
          .miejsca-tile {
            flex-direction: column !important; align-items: center !important;
            gap: 3px !important; padding: 8px 3px !important; text-align: center !important;
            opacity: 0; transform: translateY(10px);
            transition: opacity 0.35s ease, transform 0.35s ease;
          }
          .miejsca-emoji { font-size: 15px !important; }
          .miejsca-info { flex: none !important; width: 100%; }
          .miejsca-name {
            font-size: 9px !important; white-space: normal !important;
            overflow: hidden !important; display: -webkit-box !important;
            -webkit-line-clamp: 2; -webkit-box-orient: vertical !important;
            line-height: 1.25 !important; text-overflow: clip !important;
          }
          .miejsca-dist { font-size: 11px !important; }
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
