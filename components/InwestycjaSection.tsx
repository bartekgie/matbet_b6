'use client'

import { useState, useEffect, useRef } from 'react'
import { Budynek } from '@/lib/types'

const COLORS = {
  navy:     '#1B2D4F',
  red:      '#D93025',
  gold:     '#C9973A',
  bgLight:  '#F5F5F2',
  textGray: '#6B7280',
}

const STATYSTYKI = [
  { val: '33',      label: 'lat doświadczenia' },
  { val: '83',      label: 'ukończonych projektów' },
  { val: '5020',    label: 'mieszkań oddanych' },
  { val: '15941',   label: 'zadowolonych mieszkańców' },
  { val: '6',       label: 'aktywnych projektów' },
]

const FALLBACK_TEXT = 'Nowe Miasto to dynamicznie rozwijające się osiedle położone w zachodniej części Słupska, stanowiące część dzielnicy Niepodległości. Atrakcyjna lokalizacja to idealne miejsce dla osób pragnących spokojnej okolicy pełnej zieleni oraz łatwego dostępu do infrastruktury miejskiej. Na terenie osiedla powstają pięciopiętrowe budynki o wysokim standardzie, z windami, garażami i miejscami parkingowymi.'

function ptToPlain(blocks: { _type: string; children?: { text?: string }[] }[]): string {
  return (blocks ?? [])
    .filter(b => b._type === 'block')
    .map(b => (b.children ?? []).map(c => c.text ?? '').join(''))
    .join(' ')
}

/* ── SVG icons ──────────────────────────────────────────────── */
const IconLocation = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconCar      = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-4a2 2 0 0 0-.38-1.18L20 8H4L2.38 10.82A2 2 0 0 0 2 12v4h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
const IconLeaf     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
const IconShield   = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconElevator = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="2" width="18" height="20" rx="2"/><path d="M9 12 12 9l3 3"/><path d="M9 17l3 3 3-3"/></svg>
const IconSun      = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
const IconMedal    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="15" r="6"/><path d="M8.56 2.9A7 7 0 0 1 19 9"/><path d="M5 9a7 7 0 0 1 3.56-6.1"/><path d="m12 12 1.5 3 2.5.5-1.5 1.5.5 2.5L12 18l-2.5 1 .5-2.5-1.5-1.5 2.5-.5z"/></svg>
const IconBolt     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IconKids     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5"/><path d="M9 10.5h6"/><path d="M9 12.5l-2.5 5.5"/><path d="M15 12.5l2.5 5.5"/></svg>
const IconBox      = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
const IconBuilding = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>
const IconRoute    = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
const IconStar     = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

function getCechaIcon(tytul: string): React.ReactElement {
  const t = tytul.toLowerCase()
  if (t.includes('lokalizacj') || t.includes('centrum') || t.includes('miejsc') || t.includes('adres')) return <IconLocation />
  if (t.includes('parking') || t.includes('garaż') || t.includes('garaz') || t.includes('samochód')) return <IconCar />
  if (t.includes('zieleń') || t.includes('zielen') || t.includes('park') || t.includes('ogród') || t.includes('natura')) return <IconLeaf />
  if (t.includes('bezpiecz') || t.includes('monitoring') || t.includes('ochrona')) return <IconShield />
  if (t.includes('winda')) return <IconElevator />
  if (t.includes('balkon') || t.includes('taras') || t.includes('słonecz') || t.includes('widok') || t.includes('panoram')) return <IconSun />
  if (t.includes('jakość') || t.includes('jakosc') || t.includes('standard') || t.includes('materiał') || t.includes('prestiż')) return <IconMedal />
  if (t.includes('energo') || t.includes('ekolog') || t.includes('eco') || t.includes('oszczędn') || t.includes('energia')) return <IconBolt />
  if (t.includes('plac zabaw') || t.includes('dzieci') || t.includes('rodzinn') || t.includes('zabaw')) return <IconKids />
  if (t.includes('komórk') || t.includes('komork') || t.includes('piwnic') || t.includes('schowek')) return <IconBox />
  if (t.includes('architek') || t.includes('nowoczes') || t.includes('design') || t.includes('budynek') || t.includes('projekt')) return <IconBuilding />
  if (t.includes('transport') || t.includes('komunikacj') || t.includes('dostępn') || t.includes('droga') || t.includes('autobus')) return <IconRoute />
  return <IconStar />
}

/* ── CountUp — IntersectionObserver, działa na mobile ─────── */
function CountUp({ target, label }: { target: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const duration = 1800
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setCount(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div className="stat-num" style={{ fontSize: 44, fontWeight: 800, color: COLORS.gold, lineHeight: 1 }}>
        {new Intl.NumberFormat('pl-PL').format(count)}
      </div>
      <div className="stat-label" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8, maxWidth: 120 }}>
        {label}
      </div>
    </div>
  )
}

/* ── CechyGrid — fade-in przez IntersectionObserver ─────────── */
function CechyGrid({ cechy }: { cechy: { tytul: string; opis?: string }[] }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect() }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div>
      {/* Swipe hint — tylko mobile */}
      <div className="swipe-hint" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: COLORS.textGray, fontSize: 12 }}>
        <span>przesuń</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6"/>
        </svg>
      </div>
    <div ref={ref} className="cechy-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
      {cechy.map((cecha, i) => (
        <div
          key={i}
          className="cechy-tile"
          style={{
            flex:         '0 0 calc(25% - 12px)',
            scrollSnapAlign: 'start',
            position:     'relative',
            overflow:     'hidden',
            background:   '#fff',
            borderRadius: 8,
            padding:      '24px 20px 20px',
            boxShadow:    '0 2px 10px rgba(0,0,0,.07)',
            border:       '2px solid #eaecf0',
            textAlign:    'center',
            opacity:      visible ? 1 : 0,
            transform:    visible ? 'translateY(0)' : 'translateY(20px)',
            transition:   `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
          }}
        >
          <div style={{ color: COLORS.navy, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            {getCechaIcon(cecha.tytul)}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, marginBottom: 6, lineHeight: 1.3 }}>
            {cecha.tytul}
          </div>
          {cecha.opis && (
            <div style={{ fontSize: 12, color: COLORS.textGray, lineHeight: 1.6 }}>
              {cecha.opis}
            </div>
          )}
        </div>
      ))}
    </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function InwestycjaSection({ budynek }: { budynek: Budynek }) {
  const text = (budynek.opis && budynek.opis.length > 0)
    ? ptToPlain(budynek.opis)
    : FALLBACK_TEXT

  return (
    <section id="inwestycja" style={{ background: '#fff', padding: '80px 0 0 0' }}>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px' }}>

        {/* Tekst — zawsze widoczny, bez animacji blokującej */}
        <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 760, margin: '0 auto 48px' }}>
          <p style={{
            fontSize: 12, color: COLORS.red, letterSpacing: 2,
            fontWeight: 700, textTransform: 'uppercase', marginBottom: 14,
          }}>
            OSIEDLE NOWE MIASTO
          </p>
          <h2 style={{
            fontSize: 'clamp(26px, 3.5vw, 38px)',
            fontWeight: 800, color: COLORS.navy,
            marginBottom: 18, lineHeight: 1.15,
          }}>
            Najambitniejszy projekt budowlany w Słupsku
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 1.1vw, 17px)',
            lineHeight: 1.9,
            color: COLORS.textGray,
            margin: 0,
          }}>
            {text}
          </p>
        </div>

        {/* Kafle cech — fade-in przez IntersectionObserver */}
        {budynek.cechy && budynek.cechy.length > 0 && (
          <CechyGrid cechy={budynek.cechy} />
        )}

      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
        <div className="stats-box" style={{
          background: COLORS.navy,
          padding: '48px 32px',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 32,
        }}>
          {STATYSTYKI.map(s => (
            <CountUp
              key={s.label}
              target={parseInt(s.val.replace(/\s/g, ''), 10)}
              label={s.label}
            />
          ))}
        </div>
      </div>

      <style>{`
        .cechy-scroll::-webkit-scrollbar { display: none; }
        .cechy-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .cechy-tile { transition: transform .4s ease, box-shadow .4s ease; }
        .cechy-tile::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 0; height: 4px;
          background: #D93025;
          transition: width .5s ease;
        }
        .cechy-tile:hover::before { width: 100%; }
        .cechy-tile:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 24px rgba(27,45,79,.10) !important;
        }
        @media (max-width: 900px) {
          .cechy-tile { flex: 0 0 calc(50% - 8px) !important; }
        }
        @media (max-width: 480px) {
          .cechy-tile { flex: 0 0 calc(85%) !important; }
        }

        @media (max-width: 768px) {
          .stats-box { padding: 28px 20px !important; display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 24px 16px !important; }
          .stats-box > div:last-child { grid-column: 1 / -1 !important; }
          .stat-num { font-size: 34px !important; }
          .stat-label { font-size: 11px !important; margin-top: 6px !important; max-width: none !important; }
          .cechy-tile:active { transform: scale(0.95) translateY(0) !important; }
        }
      `}</style>
    </section>
  )
}
