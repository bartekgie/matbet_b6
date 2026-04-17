import Image from 'next/image'
import { Budynek } from '@/lib/types'

const COLORS = {
  navy:  '#1B2D4F',
  red:   '#D93025',
  gold:  '#C9973A',
  white: '#FFFFFF',
}

export default function HeroSection({ budynek, wolneLokali }: { budynek: Budynek; wolneLokali: number }) {
  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      minHeight: 600,
      overflow: 'hidden',
    }}>
      {/* Zdjęcie tła */}
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

      {/* Nakładka */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(27,45,79,0.5) 0%, rgba(27,45,79,0.75) 100%)',
      }} />

      {/* Treść */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        {/* Nadtytuł */}
        <p style={{
          fontSize: 12,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 16,
          textTransform: 'uppercase',
        }}>
          Osiedle Nowe Miasto • Słupsk
        </p>

        {/* Nazwa budynku */}
        <h1 style={{
          fontSize: 'clamp(40px, 8vw, 64px)',
          fontWeight: 800,
          color: COLORS.white,
          lineHeight: 1.1,
          marginBottom: 16,
        }}>
          {budynek.nazwa}
        </h1>

        {/* Podtytuł */}
        {budynek.podtytul && (
          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.8)',
            marginBottom: 40,
          }}>
            {budynek.podtytul}
          </p>
        )}

        {/* Statystyki */}
        <div style={{
          display: 'flex',
          gap: 40,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 48,
        }}>
          {[
            { val: budynek.liczbaLokali ?? '—', label: 'lokali' },
            { val: budynek.kondygnacje ?? '—',  label: 'kondygnacji' },
            { val: wolneLokali,                  label: 'dostępnych' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: COLORS.gold, lineHeight: 1 }}>
                {val}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Przyciski */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
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
          <a
            href="#inwestycja"
            style={{
              border: '2px solid rgba(255,255,255,0.5)',
              background: 'transparent',
              color: COLORS.white,
              padding: '14px 32px',
              borderRadius: 25,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Dowiedz się więcej
          </a>
        </div>
      </div>

      {/* Strzałka scroll */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'bounce 1.5s infinite',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>
    </section>
  )
}
