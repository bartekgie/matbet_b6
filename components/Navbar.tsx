'use client'

import { useEffect, useState } from 'react'

const COLORS = {
  navy:  '#1B2D4F',
  red:   '#D93025',
  white: '#FFFFFF',
}

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function Navbar({ budynekNazwa }: { budynekNazwa: string }) {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { href: '#mieszkania',  label: 'Mieszkania' },
    { href: '#inwestycja',  label: 'Inwestycja' },
    { href: '#galeria',     label: 'Galeria' },
    { href: '#lokalizacja', label: 'Lokalizacja' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(27, 45, 79, 0.96)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      height: 80,
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.3)' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      <div className="nav-inner" style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 32px',
        height: '100%', display: 'flex', alignItems: 'center', gap: 24,
      }}>

        {/* Logo */}
        <a href="https://matbet.com.pl" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="nav-logo-img" src="/Logo%20-%20Matbet%20-%20bia%C5%82e.png" alt="Matbet" style={{ height: 40, width: 'auto' }} />
        </a>

        {/* Breadcrumb */}
        <div className="nav-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Osiedle Nowe Miasto</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>/</span>
          <span style={{ fontSize: 13, color: COLORS.white, fontWeight: 700 }}>{budynekNazwa}</span>
        </div>

        {/* Linki (ukryte na mobile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{
              color: 'rgba(255,255,255,0.75)', fontSize: 13, textDecoration: 'none',
              transition: 'color 0.15s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = COLORS.white)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a className="nav-cta"
          href={`mailto:matbet@matbet.com.pl?subject=Zapytanie o lokal – ${budynekNazwa}`}
          style={{
            background: COLORS.red, color: COLORS.white,
            padding: '8px 18px', borderRadius: 20,
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          Zapytaj o lokal
        </a>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, background: menuOpen ? 'rgba(255,255,255,0.1)' : 'none',
            border: 'none', cursor: 'pointer', color: COLORS.white,
            flexShrink: 0, borderRadius: 8, transition: 'background 0.15s',
          }}
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>

      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 80, left: 0, right: 0,
          background: 'rgba(27, 45, 79, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column',
          paddingBottom: 8, zIndex: 99,
        }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: 600,
                textDecoration: 'none', padding: '14px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-inner { padding: 0 16px !important; gap: 0 !important; justify-content: space-between !important; position: relative !important; }
          .nav-logo-img { height: 28px !important; }
          .nav-breadcrumb { display: none !important; }
          .nav-cta {
            position: absolute !important;
            left: 50% !important; top: 50% !important;
            transform: translate(-50%, -50%) !important;
            padding: 8px 16px !important; font-size: 12px !important;
            border-radius: 16px !important; white-space: nowrap !important;
          }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
