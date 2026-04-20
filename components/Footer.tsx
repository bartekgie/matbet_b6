'use client'

const COLORS = {
  navy:  '#1B2D4F',
  red:   '#D93025',
  white: '#FFFFFF',
}


const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const LINKI = [
  { label: 'O nas',        href: 'https://matbet.com.pl/o-nas' },
  { label: 'RODO',         href: 'https://matbet.com.pl/rodo' },
  { label: 'Jak budujemy', href: 'https://matbet.com.pl/jak-budujemy' },
  { label: 'Kontakt',      href: 'https://matbet.com.pl/kontakt' },
]

export default function Footer() {
  return (
    <footer style={{ background: COLORS.navy, padding: '60px 0 0 0', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>

        {/* Górna część — 3 kolumny */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 48,
          paddingBottom: 48,
        }} className="footer-grid">

          {/* Kolumna 1 — O nas */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo%20-%20Matbet%20-%20bia%C5%82e.png" alt="Matbet" style={{ height: 56, width: 'auto' }} />
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              maxWidth: 280,
              marginTop: 16,
              marginBottom: 20,
            }}>
              MATBET Sp. z o.o. to firma zajmująca się projektowaniem, budową
              i sprzedażą mieszkań. Jesteśmy wiodącym realizatorem budownictwa
              mieszkaniowego w województwie pomorskim i zachodniopomorskim.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a
                href="https://www.facebook.com/matbetslupsk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
              >
                <IconFacebook />
              </a>
              <a
                href="https://www.instagram.com/matbet_deweloper/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}
              >
                <IconInstagram />
              </a>
            </div>
          </div>

          {/* Kolumna 2 — Informacje */}
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>
              Informacje o firmie
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LINKI.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)' }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Kolumna 3 — Kontakt */}
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, fontWeight: 700, marginBottom: 20, textTransform: 'uppercase' }}>
              Kontakt
            </p>
            <a href="tel:+48519326296" style={{ display: 'block', color: '#fff', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginBottom: 8 }}>
              +48 519 326 296
            </a>
            <a href="mailto:matbet@matbet.com.pl" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', marginBottom: 12 }}>
              matbet@matbet.com.pl
            </a>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
              ul. Poznańska 75<br />76-200 Słupsk
            </p>
          </div>
        </div>

        {/* Dolna belka */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            © 2025 – Matbet Sp. z o.o. Wszystkie prawa zastrzeżone.
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
