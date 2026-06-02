'use client'

import Image from 'next/image'
import { Budynek } from '@/lib/types'
import { useState, useEffect } from 'react'

const COLORS = {
  navy:  '#1B2D4F',
  gold:  '#D5A23F',
  text:  '#404040',
  white: '#FFFFFF',
}

function HeroCountUp({ target, delay }: { target: number; delay: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      const duration = 500
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(t)
  }, [target, delay])

  return <>{count}</>
}

export default function HeroSection({ budynek, wolneLokali }: { budynek: Budynek; wolneLokali: number }) {

  useEffect(() => {
    const t = setTimeout(() => {
      if (window.scrollY === 0) {
        const el = document.getElementById('mieszkania')
        if (el) window.scrollTo({ top: el.offsetTop - 40, behavior: 'smooth' })
      }
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  const lokaleNum   = typeof budynek.liczbaLokali === 'number' ? budynek.liczbaLokali : null
  const kondNum     = typeof budynek.kondygnacje  === 'number' ? budynek.kondygnacje  : null

  const stats = [
    { num: lokaleNum,  fallback: budynek.liczbaLokali ?? '—', label: 'lokali',       delay: 0    },
    { num: kondNum,    fallback: budynek.kondygnacje  ?? '—', label: 'kondygnacji',  delay: 550  },
    { num: wolneLokali, fallback: wolneLokali,                label: 'dostępnych',   delay: 1100 },
  ]

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>

      {budynek.heroUrl ? (
        <Image
          src={budynek.heroUrl}
          alt={budynek.nazwa}
          fill
          priority
          style={{ objectFit: 'cover' }}
          sizes="100vw"
          placeholder={budynek.heroLqip ? 'blur' : 'empty'}
          blurDataURL={budynek.heroLqip}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: COLORS.navy }} />
      )}

      {/* Overlay dla czytelności tekstu */}
      <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />

      <div className="hero-content" style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <p className="hero-location" style={{ letterSpacing: 3, color: COLORS.text, marginBottom: 16, textTransform: 'uppercase', opacity: 0.7 }}>
          Osiedle Nowe Miasto • Słupsk
        </p>

        <h1 className="hero-title" style={{ fontWeight: 800, color: COLORS.text, lineHeight: 1.1, marginBottom: 16 }}>
          {budynek.nazwa}
        </h1>

        {budynek.podtytul && (
          <p className="hero-subtitle" style={{ color: COLORS.text, opacity: 0.75, marginBottom: 40 }}>
            {budynek.podtytul}
          </p>
        )}

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {stats.map(({ num, fallback, label, delay }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="hero-stat-num" style={{ fontWeight: 800, color: COLORS.gold, lineHeight: 1 }}>
                {num != null ? <HeroCountUp target={num} delay={delay} /> : String(fallback)}
              </div>
              <div className="hero-stat-label" style={{ color: COLORS.text, opacity: 0.65, marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a
            href="#mieszkania"
            className="hero-cta-btn"
            style={{
              background: COLORS.gold,
              color: COLORS.white,
              borderRadius: 25,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Znajdź mieszkanie
          </a>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'bounce 1.5s infinite' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12l7 7 7-7" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style>{`
        .hero-overlay  { background: linear-gradient(to bottom, rgba(244,243,239,0.35) 0%, rgba(244,243,239,0.55) 50%, rgba(244,243,239,0.35) 100%); }
        .hero-location { font-size: 12px; }
        .hero-title    { font-size: clamp(40px, 8vw, 64px); }
        .hero-subtitle { font-size: 18px; }
        .hero-stat-num { font-size: 90px; }
        .hero-stat-label { font-size: 12px; }
        .hero-cta-btn  { font-size: 15px; padding: 14px 32px; transition: background 0.15s, transform 0.15s, box-shadow 0.15s; }
        .hero-cta-btn:hover { background: #C4922A !important; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(213,162,63,0.35); }

        @media (min-width: 769px) {
          .hero-overlay  { background: linear-gradient(to bottom, rgba(244,243,239,0.45) 0%, rgba(244,243,239,0.82) 50%, rgba(244,243,239,0.45) 100%); }
          .hero-location { font-size: 14px; }
          .hero-title    { font-size: clamp(48px, 9.6vw, 77px); }
          .hero-subtitle { font-size: 22px; }
          .hero-stat-num { font-size: 108px; }
          .hero-stat-label { font-size: 14px; }
          .hero-cta-btn  { font-size: 18px; padding: 17px 38px; }
        }

        @media (max-width: 768px) {
          .hero-stat-num { font-size: 40px; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  )
}
