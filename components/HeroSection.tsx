'use client'

import Image from 'next/image'
import { Budynek } from '@/lib/types'
import { useState, useEffect } from 'react'

const COLORS = {
  navy:  '#1B2D4F',
  red:   '#D93025',
  gold:  '#C9973A',
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

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(27,45,79,0.5) 0%, rgba(27,45,79,0.75) 100%)',
      }} />

      <div style={{
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
        <p style={{ fontSize: 12, letterSpacing: 3, color: 'rgba(255,255,255,0.7)', marginBottom: 16, textTransform: 'uppercase' }}>
          Osiedle Nowe Miasto • Słupsk
        </p>

        <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 800, color: COLORS.white, lineHeight: 1.1, marginBottom: 16 }}>
          {budynek.nazwa}
        </h1>

        {budynek.podtytul && (
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40 }}>
            {budynek.podtytul}
          </p>
        )}

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          {stats.map(({ num, fallback, label, delay }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div className="hero-stat-num" style={{ fontWeight: 800, color: COLORS.gold, lineHeight: 1 }}>
                {num != null ? <HeroCountUp target={num} delay={delay} /> : String(fallback)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a
            href="#mieszkania"
            style={{
              background: COLORS.red,
              color: COLORS.white,
              padding: '14px 32px',
              borderRadius: 25,
              fontWeight: 700,
              fontSize: 15,
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
          <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style>{`
        .hero-stat-num { font-size: 80px; }
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
