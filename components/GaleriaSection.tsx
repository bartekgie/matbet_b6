'use client'

import { useState } from 'react'
import Image from 'next/image'
import { GaleriaItem } from '@/lib/types'

const COLORS = {
  navy:    '#1B2D4F',
  red:     '#D93025',
  bgLight: '#F5F5F2',
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* Nagłówek */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: 2, color: COLORS.red, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>GALERIA</p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.navy }}>Nasza inwestycja</h2>
        </div>

        {/* Siatka zdjęć */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {galeria.map((item, i) => (
            <div
              key={i}
              onClick={() => otworzLightbox(i)}
              style={{
                position: 'relative',
                aspectRatio: i === 0 ? '1' : '4/3',
                gridColumn: i === 0 ? 'span 2' : undefined,
                gridRow: i === 0 ? 'span 2' : undefined,
                borderRadius: 8,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <Image
                src={`${item.url}?w=800&fit=crop&auto=format`}
                alt={item.alt || `Zdjęcie ${i + 1}`}
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder={item.lqip ? 'blur' : 'empty'}
                blurDataURL={item.lqip}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
              />
              {/* Overlay on hover */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(27,45,79,0)',
                transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,45,79,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(27,45,79,0)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={zamknij}
        >
          {/* Zdjęcie */}
          <div
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', width: '100%', height: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={`${galeria[lightbox.index].url}?w=1600&auto=format`}
              alt={galeria[lightbox.index].alt || `Zdjęcie ${lightbox.index + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="90vw"
            />
          </div>

          {/* Zamknij */}
          <button
            onClick={zamknij}
            style={{
              position: 'fixed', top: 20, right: 24,
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
              width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
              fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>

          {/* Poprzednie */}
          {galeria.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              style={{
                position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
                fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ‹
            </button>
          )}

          {/* Następne */}
          {galeria.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              style={{
                position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: 52, height: 52, borderRadius: '50%', cursor: 'pointer',
                fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ›
            </button>
          )}

          {/* Licznik */}
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
          }}>
            {lightbox.index + 1} / {galeria.length}
          </div>
        </div>
      )}
    </section>
  )
}
