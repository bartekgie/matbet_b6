'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GaleriaItem } from '@/lib/types'

const COLORS = {
  navy:    '#1B2D4F',
  red:     '#D93025',
  bgLight: '#F5F5F2',
}

function Thumb({ item, index, onClick, sizes = '25vw' }: {
  item: GaleriaItem; index: number; onClick: () => void; sizes?: string
}) {
  return (
    <div onClick={onClick} style={{ position: 'relative', width: '100%', height: '100%', cursor: 'pointer', overflow: 'hidden', borderRadius: 'inherit' }}>
      <Image
        src={`${item.url}?w=1200&fit=crop&auto=format`}
        alt={item.alt || `Zdjęcie ${index + 1}`}
        fill
        style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
        sizes={sizes}
        placeholder={item.lqip ? 'blur' : 'empty'}
        blurDataURL={item.lqip}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      />
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.25s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.18)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)' }}
      />
    </div>
  )
}

export default function GaleriaSection({ galeria }: { galeria: GaleriaItem[] }) {
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })

  if (!galeria || galeria.length === 0) return null

  const otworzLightbox = (index: number) => setLightbox({ open: true, index })
  const zamknij = () => setLightbox({ open: false, index: 0 })
  const prev = () => setLightbox(s => ({ ...s, index: (s.index - 1 + galeria.length) % galeria.length }))
  const next = () => setLightbox(s => ({ ...s, index: (s.index + 1) % galeria.length }))

  return (
    <section id="galeria" style={{ background: COLORS.bgLight, padding: '100px 0' }}>
      <style>{`
        /*
          Airbnb-style grid:
          kolumna lewa (60%) — jedno duże zdjęcie, pełna wysokość
          kolumna prawa (40%) — siatka 2×2 czterech równych thumbnails
          Całość: aspect-ratio 16/8 = skala się naturalnie z szerokością
        */
        .gal-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          aspect-ratio: 16 / 8;
          border-radius: 16px;
          overflow: hidden;
        }
        .gal-cell-big {
          grid-row: 1 / span 2;
          border-radius: 0;
          overflow: hidden;
        }
        .gal-cell-small-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          grid-row: 1 / span 2;
        }
        .gal-cell-small {
          overflow: hidden;
          position: relative;
        }

        /* Przycisk "Pokaż wszystkie" — overlay na ostatnim kafelku jeśli zdjęć > 5 */
        .gal-more-btn {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .gal-more-btn:hover { background: rgba(0,0,0,0.6); }
        .gal-more-label {
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          border: 2px solid rgba(255,255,255,0.7);
          border-radius: 8px;
          padding: 8px 18px;
          pointer-events: none;
        }

        /* Mobile: stack w kolumnę */
        @media (max-width: 640px) {
          .gal-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            aspect-ratio: unset;
            border-radius: 10px;
          }
          .gal-cell-big {
            grid-row: 1;
            aspect-ratio: 4 / 3;
          }
          .gal-cell-small-wrap {
            grid-row: 2;
            aspect-ratio: 2 / 1;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* Nagłówek */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 2, color: COLORS.red, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>GALERIA</p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.navy }}>Nasza inwestycja</h2>
        </div>

        {/* Siatka Airbnb-style */}
        <div className="gal-grid">

          {/* Duże zdjęcie — lewa kolumna, pełna wysokość */}
          {galeria[0] && (
            <div className="gal-cell-big">
              <Thumb item={galeria[0]} index={0} onClick={() => otworzLightbox(0)} sizes="(max-width: 640px) 100vw, 60vw" />
            </div>
          )}

          {/* 4 małe — prawa kolumna 2×2 */}
          <div className="gal-cell-small-wrap">
            {[1, 2, 3, 4].map(i => galeria[i] && (
              <div key={i} className="gal-cell-small" style={{ position: 'relative' }}>
                <Thumb item={galeria[i]} index={i} onClick={() => otworzLightbox(i)} sizes="(max-width: 640px) 50vw, 20vw" />

                {/* "Pokaż wszystkie" overlay na ostatnim kafelku, gdy jest więcej zdjęć */}
                {i === 4 && galeria.length > 5 && (
                  <div className="gal-more-btn" onClick={() => otworzLightbox(4)}>
                    <span className="gal-more-label">+{galeria.length - 5} zdjęć</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={zamknij}
        >
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={`${galeria[lightbox.index].url}?w=1800&auto=format`}
              alt={galeria[lightbox.index].alt || `Zdjęcie ${lightbox.index + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
            />
          </div>

          <button onClick={zamknij} style={{ position: 'fixed', top: 20, right: 24, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

          {galeria.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 52, height: 52, borderRadius: '50%', cursor: 'pointer', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 52, height: 52, borderRadius: '50%', cursor: 'pointer', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>}

          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {lightbox.index + 1} / {galeria.length}
          </div>
        </div>
      )}
    </section>
  )
}
