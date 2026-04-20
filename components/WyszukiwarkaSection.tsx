'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lokal } from '@/lib/types'

const COLORS = {
  navy: '#1B2D4F',
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  wolne:      { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' },
  rezerwacja: { bg: '#fff8e1', text: '#f57f17', dot: '#ffc107' },
  sprzedane:  { bg: '#fce4ec', text: '#c62828', dot: '#ef5350' },
}

const fmt = (cena: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(cena)

const INIT_FILTRY = { pokoje: '', pietro: '', status: '' }

type Sortowanie = 'cena_asc' | 'cena_desc' | 'pow_asc' | 'pow_desc' | 'pietro_asc' | 'pietro_desc' | 'pokoje_asc' | 'pokoje_desc'
type Widok = 'kafelki' | 'tabela'
type TableSortCol = 'nr' | 'pietro' | 'pokoje' | 'powierzchnia' | 'cena' | 'cenaZaMetr'

const SORT_OPCJE: { value: Sortowanie; label: string }[] = [
  { value: 'cena_asc',    label: 'Cena: od najniższej' },
  { value: 'cena_desc',   label: 'Cena: od najwyższej' },
  { value: 'pow_asc',     label: 'Powierzchnia: od najmniejszej' },
  { value: 'pow_desc',    label: 'Powierzchnia: od największej' },
  { value: 'pietro_asc',  label: 'Piętro: od najniższego' },
  { value: 'pietro_desc', label: 'Piętro: od najwyższego' },
  { value: 'pokoje_asc',  label: 'Pokoje: od najmniejszej liczby' },
  { value: 'pokoje_desc', label: 'Pokoje: od największej liczby' },
]

function sortuj(lista: Lokal[], sort: Sortowanie) {
  return [...lista].sort((a, b) => {
    if (sort === 'cena_asc')    return ((a.cenaZaMetr ?? 0) * a.powierzchnia) - ((b.cenaZaMetr ?? 0) * b.powierzchnia)
    if (sort === 'cena_desc')   return ((b.cenaZaMetr ?? 0) * b.powierzchnia) - ((a.cenaZaMetr ?? 0) * a.powierzchnia)
    if (sort === 'pow_asc')     return a.powierzchnia - b.powierzchnia
    if (sort === 'pow_desc')    return b.powierzchnia - a.powierzchnia
    if (sort === 'pietro_asc')  return a.pietro - b.pietro
    if (sort === 'pietro_desc') return b.pietro - a.pietro
    if (sort === 'pokoje_asc')  return a.pokoje - b.pokoje
    if (sort === 'pokoje_desc') return b.pokoje - a.pokoje
    return 0
  })
}

const IkonaKafelki = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="0" width="7" height="7" rx="1.5"/>
    <rect x="9" y="0" width="7" height="7" rx="1.5"/>
    <rect x="0" y="9" width="7" height="7" rx="1.5"/>
    <rect x="9" y="9" width="7" height="7" rx="1.5"/>
  </svg>
)

const IkonaTabela = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="0" y="0" width="16" height="3" rx="1"/>
    <rect x="0" y="5" width="16" height="3" rx="1"/>
    <rect x="0" y="10" width="16" height="3" rx="1"/>
    <rect x="0" y="15" width="16" height="1" rx="0.5"/>
  </svg>
)

// ─── Modal porównywarki ────────────────────────────────────────────────────────
function Porownywarka({ lokale, onClose }: { lokale: Lokal[]; onClose: () => void }) {
  const n = lokale.length
  const best = (vals: number[], preferMin: boolean) => {
    const fn = preferMin ? Math.min : Math.max
    return fn(...vals)
  }
  const ceny     = lokale.map(l => Math.round((l.cenaZaMetr ?? 0) * l.powierzchnia))
  const pow      = lokale.map(l => l.powierzchnia)
  const bestCena  = best(ceny, true)
  const bestPow   = best(pow, false)

  const hl = (isBest: boolean): React.CSSProperties => isBest
    ? { background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, borderRadius: 8, padding: '4px 8px' }
    : { padding: '4px 8px' }

  const ROWS: { label: string; render: (l: Lokal) => React.ReactNode }[] = [
    {
      label: 'Zdjęcie',
      render: (l) => {
        const thumb = l.thumb || l.thumbRzut
        return thumb ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
            <Image src={`${thumb}?w=400&fit=crop&auto=format`} alt={`Apartament ${l.nr}`} fill style={{ objectFit: 'cover' }} sizes="33vw" />
          </div>
        ) : (
          <div style={{ aspectRatio: '4/3', background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>
            Brak zdjęcia
          </div>
        )
      }
    },
    { label: 'Numer', render: (l) => <strong style={{ fontSize: 16 }}>Apartament {l.nr}</strong> },
    { label: 'Status', render: (l) => {
      const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.text, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
          {l.status}
        </span>
      )
    }},
    { label: 'Piętro',       render: (l) => l.pietro === 0 ? 'Parter' : `${l.pietro} p.` },
    { label: 'Pokoje',       render: (l) => `${l.pokoje} ${l.pokoje === 1 ? 'pokój' : 'pokoje'}` },
    { label: 'Powierzchnia', render: (l) => <span style={hl(l.powierzchnia === bestPow)}>{l.powierzchnia} m²</span> },
    {
      label: 'Cena',
      render: (l) => {
        const cena = Math.round((l.cenaZaMetr ?? 0) * l.powierzchnia)
        return <span style={hl(cena === bestCena)}>{fmt(cena)}</span>
      }
    },
    {
      label: 'Cena / m²',
      render: (l) => <span>{(l.cenaZaMetr ?? 0).toLocaleString('pl-PL')} zł</span>
    },
    { label: 'Balkon / Ogródek', render: (l) => {
      if (!l.balkon?.typ || l.balkon.typ === 'brak') return <span style={{ color: '#aaa' }}>–</span>
      const ikona = l.balkon.typ === 'balkon' ? '🌿 Balkon' : '🌱 Ogródek'
      const pow   = l.balkon.powierzchnia ? ` · ${l.balkon.powierzchnia} m²` : ''
      return <span style={{ color: '#2e7d32', fontWeight: 700 }}>{ikona}{pow}</span>
    }},
    {
      label: '',
      render: (l) => (
        <Link href={`/lokal/${l._id}`} style={{
          display: 'inline-block', padding: '8px 18px', borderRadius: 20,
          background: COLORS.navy, color: '#fff', textDecoration: 'none',
          fontSize: 13, fontWeight: 600,
        }}>
          Zobacz lokal →
        </Link>
      )
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,20,.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '32px 16px', overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 900, boxShadow: '0 24px 80px rgba(0,0,0,.3)', overflow: 'hidden' }}>
        <div style={{ background: COLORS.navy, color: '#fff', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Porównanie lokali</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: '#8888aa' }}>
              {n} {n === 1 ? 'lokal' : n < 5 ? 'lokale' : 'lokali'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ padding: '10px 28px', background: '#f7f8fa', borderBottom: '1px solid #eee', fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#e8f5e9', borderRadius: 3, border: '1px solid #b2dfdb' }} />
          Najlepsza wartość w porównaniu
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #f0f0f0', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                  {row.label
                    ? <td style={{ padding: '14px 20px', width: 130, minWidth: 110, fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: .8, verticalAlign: 'middle' }}>{row.label.toUpperCase()}</td>
                    : <td style={{ width: 130 }} />
                  }
                  {lokale.map(l => (
                    <td key={l._id} style={{ padding: '14px 20px', verticalAlign: 'middle', borderLeft: '1px solid #f0f0f0', textAlign: 'center', color: '#333' }}>
                      {row.render(l)}
                    </td>
                  ))}
                  {Array.from({ length: 3 - n }).map((_, ei) => (
                    <td key={ei} style={{ padding: '14px 20px', borderLeft: '1px dashed #eee', background: '#fafafa', opacity: .4 }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Pasek porównywarki ────────────────────────────────────────────────────────
function PasekPorownania({ wybrane, lokale, onToggle, onOpen, onClear }: {
  wybrane: string[]
  lokale: Lokal[]
  onToggle: (id: string) => void
  onOpen: () => void
  onClear: () => void
}) {
  if (wybrane.length === 0) return null
  const wybrane_ = wybrane.map(id => lokale.find(l => l._id === id)).filter(Boolean) as Lokal[]

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900, background: COLORS.navy, color: '#fff', boxShadow: '0 -4px 24px rgba(0,0,0,.25)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#8888aa', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>PORÓWNAJ ({wybrane.length}/3)</span>
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          {wybrane_.map(l => (
            <div key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '6px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Apartament {l.nr}</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>{l.powierzchnia} m²</span>
              <button onClick={() => onToggle(l._id)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>✕</button>
            </div>
          ))}
          {Array.from({ length: 3 - wybrane_.length }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 36, borderRadius: 10, border: '1.5px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.3)', fontSize: 12 }}>
              + dodaj lokal
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClear} style={{ padding: '8px 16px', borderRadius: 20, border: '1.5px solid rgba(255,255,255,.2)', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 13 }}>Wyczyść</button>
          <button onClick={onOpen} disabled={wybrane.length < 2} style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: wybrane.length >= 2 ? '#4f7cff' : 'rgba(255,255,255,.1)', color: wybrane.length >= 2 ? '#fff' : '#555', cursor: wybrane.length >= 2 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, transition: 'background .15s' }}>
            Porównaj →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Główny komponent sekcji ───────────────────────────────────────────────────
export default function WyszukiwarkaSection({ lokale }: { lokale: Lokal[] }) {
  const router = useRouter()

  const [filtry, setFiltry]         = useState(INIT_FILTRY)
  const [sortowanie, setSortowanie] = useState<Sortowanie>('cena_asc')
  const [widok, setWidok]           = useState<Widok>('kafelki')
  const [porownaj, setPorownaj]     = useState<string[]>([])
  const [showModal, setShowModal]   = useState(false)
  const [powRange, setPowRange]     = useState<[number, number]>([0, 9999])
  const [tableSort, setTableSort]   = useState<{ col: TableSortCol | null; dir: 'asc' | 'desc' }>({ col: null, dir: 'asc' })

  const handleTableSort = (col: TableSortCol) => {
    setTableSort(prev => prev.col === col
      ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { col, dir: 'asc' }
    )
  }

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal])

  const togglePorownaj = (id: string) => {
    setPorownaj(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const pietra   = [...new Set(lokale.map(l => l.pietro))].sort((a, b) => a - b)
  const pokojeOp = [...new Set(lokale.map(l => l.pokoje))].sort((a, b) => a - b)

  const powBounds = useMemo(() => {
    const vals = lokale.map(l => l.powierzchnia).filter(v => v != null && v > 0)
    if (!vals.length) return { min: 0, max: 200 }
    return { min: Math.floor(Math.min(...vals)), max: Math.ceil(Math.max(...vals)) }
  }, [lokale])

  useEffect(() => {
    setPowRange([powBounds.min, powBounds.max])
  }, [powBounds.min, powBounds.max])

  const powAktywny = powRange[0] > powBounds.min || powRange[1] < powBounds.max

  const select = (key: string, val: string) =>
    setFiltry(f => ({ ...f, [key]: f[key as keyof typeof f] === val ? '' : val }))

  const przefiltrowane = useMemo(() => {
    const filtered = lokale.filter(l => {
      if (filtry.pokoje && l.pokoje !== Number(filtry.pokoje)) return false
      if (filtry.pietro && l.pietro !== Number(filtry.pietro)) return false
      if (filtry.status && l.status !== filtry.status)         return false
      if (l.powierzchnia < powRange[0] || l.powierzchnia > powRange[1]) return false
      return true
    })
    return sortuj(filtered, sortowanie)
  }, [lokale, filtry, sortowanie, powRange])

  const tabelaWyniki = useMemo(() => {
    if (!tableSort.col) return przefiltrowane
    const { col, dir } = tableSort
    return [...przefiltrowane].sort((a, b) => {
      let va = 0, vb = 0
      if (col === 'nr')          { va = parseInt(a.nr) || 0; vb = parseInt(b.nr) || 0 }
      if (col === 'pietro')      { va = a.pietro;            vb = b.pietro }
      if (col === 'pokoje')      { va = a.pokoje;            vb = b.pokoje }
      if (col === 'powierzchnia'){ va = a.powierzchnia;      vb = b.powierzchnia }
      if (col === 'cena')        { va = (a.cenaZaMetr ?? 0) * a.powierzchnia; vb = (b.cenaZaMetr ?? 0) * b.powierzchnia }
      if (col === 'cenaZaMetr')  { va = a.cenaZaMetr ?? 0;  vb = b.cenaZaMetr ?? 0 }
      return dir === 'asc' ? va - vb : vb - va
    })
  }, [przefiltrowane, tableSort])

  const wybraneObiekty = porownaj.map(id => lokale.find(l => l._id === id)).filter(Boolean) as Lokal[]

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
    borderColor: active ? COLORS.navy : '#ddd',
    background: active ? COLORS.navy : '#fff',
    color: active ? '#fff' : '#444',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  })

  return (
    <section id="mieszkania" style={{ paddingTop: 80, paddingBottom: porownaj.length > 0 ? 90 : 0, background: '#f0f2f5', fontFamily: 'sans-serif' }}>

      {showModal && <Porownywarka lokale={wybraneObiekty} onClose={() => setShowModal(false)} />}

      {/* Nagłówek sekcji */}
      <div style={{ textAlign: 'center', paddingBottom: 40, paddingTop: 8 }}>
        <p style={{ fontSize: 12, letterSpacing: 2, color: '#D93025', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>DOSTĘPNE LOKALE</p>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.navy, marginBottom: 12 }}>Znajdź mieszkanie</h2>
        <p style={{ fontSize: 16, color: '#6B7280' }}>Wybierz lokal dopasowany do Twoich potrzeb</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 32px' }}>

        {/* FILTRY */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>

            <div style={{ flex: '1 1 220px', minWidth: 220, alignSelf: 'flex-start' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>
                POWIERZCHNIA:&nbsp;
                <span style={{ color: COLORS.navy, fontWeight: 700 }}>{powRange[0]}–{powRange[1]} m²</span>
              </div>
              <div style={{ position: 'relative', height: 20, margin: '4px 8px 0' }}>
                {/* Track background */}
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'rgba(27,45,79,.15)', borderRadius: 2, transform: 'translateY(-50%)' }}>
                  {/* Active range fill */}
                  <div style={{
                    position: 'absolute',
                    left: `${((powRange[0] - powBounds.min) / Math.max(powBounds.max - powBounds.min, 1)) * 100}%`,
                    right: `${(1 - (powRange[1] - powBounds.min) / Math.max(powBounds.max - powBounds.min, 1)) * 100}%`,
                    height: '100%', background: COLORS.navy, borderRadius: 2,
                  }} />
                </div>
                {/* Low handle input */}
                <input
                  type="range"
                  min={powBounds.min} max={powBounds.max}
                  value={powRange[0]}
                  onChange={e => setPowRange([Math.min(Number(e.target.value), powRange[1] - 1), powRange[1]])}
                  className="pow-slider"
                  style={{ zIndex: powRange[0] > powBounds.min + (powBounds.max - powBounds.min) * 0.9 ? 5 : 3 }}
                />
                {/* High handle input */}
                <input
                  type="range"
                  min={powBounds.min} max={powBounds.max}
                  value={powRange[1]}
                  onChange={e => setPowRange([powRange[0], Math.max(Number(e.target.value), powRange[0] + 1)])}
                  className="pow-slider"
                  style={{ zIndex: 4 }}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>LICZBA POKOI</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pokojeOp.map(p => (
                  <button key={p} style={chipStyle(filtry.pokoje === String(p))} onClick={() => select('pokoje', String(p))}>
                    {p} {p === 1 ? 'pokój' : 'pokoje'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>PIĘTRO</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {pietra.map(p => (
                  <button key={p} style={chipStyle(filtry.pietro === String(p))} onClick={() => select('pietro', String(p))}>
                    {p === 0 ? 'Parter' : `${p} p.`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>STATUS</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['wolne', 'rezerwacja', 'sprzedane'].map(s => (
                  <button key={s} style={chipStyle(filtry.status === s)} onClick={() => select('status', s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {(Object.values(filtry).some(Boolean) || powAktywny) && (
              <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                <button onClick={() => { setFiltry(INIT_FILTRY); setPowRange([powBounds.min, powBounds.max]) }} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid #eee', background: '#f9f9f9', color: '#999', cursor: 'pointer', fontSize: 13 }}>
                  ✕ Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pasek: licznik + sortowanie + widok */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ color: '#888', fontSize: 13, flex: 1, minWidth: 160 }}>
            Znaleziono <strong style={{ color: COLORS.navy }}>{przefiltrowane.length}</strong> lokali
            {(Object.values(filtry).some(Boolean) || powAktywny) && ` (z ${lokale.length} wszystkich)`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1, whiteSpace: 'nowrap' }}>SORTUJ</span>
            <select
              value={sortowanie}
              onChange={e => setSortowanie(e.target.value as Sortowanie)}
              style={{
                padding: '6px 12px', borderRadius: 20, border: '1.5px solid #ddd',
                background: '#fff', color: '#333', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', outline: 'none', appearance: 'none',
                paddingRight: 28,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
              }}
            >
              {SORT_OPCJE.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1, whiteSpace: 'nowrap' }}>WIDOK</span>
            <div style={{ display: 'flex', borderRadius: 20, border: '1.5px solid #ddd', overflow: 'hidden' }}>
              {(['kafelki', 'tabela'] as Widok[]).map(w => (
                <button key={w} onClick={() => setWidok(w)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: widok === w ? COLORS.navy : '#fff', color: widok === w ? '#fff' : '#666' }}>
                  {w === 'kafelki' ? <IkonaKafelki /> : <IkonaTabela />}
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wyniki */}
        {przefiltrowane.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>Brak lokali spełniających kryteria</div>
        ) : widok === 'kafelki' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {przefiltrowane.map(l => {
              const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
              const thumb = l.thumb || l.thumbRzut
              const wPorownaniu = porownaj.includes(l._id)
              const maxOsiagniete = porownaj.length >= 3 && !wPorownaniu
              return (
                <div key={l._id} style={{ position: 'relative' }}>
                  <button
                    onClick={() => togglePorownaj(l._id)}
                    disabled={maxOsiagniete}
                    title={wPorownaniu ? 'Usuń z porównania' : maxOsiagniete ? 'Można porównać max 3 lokale' : 'Dodaj do porównania'}
                    style={{
                      position: 'absolute', top: thumb ? 10 : 12, right: 10, zIndex: 10,
                      width: 28, height: 28, borderRadius: '50%', border: '2px solid',
                      borderColor: wPorownaniu ? '#4f7cff' : 'rgba(255,255,255,.8)',
                      background: wPorownaniu ? '#4f7cff' : 'rgba(255,255,255,.9)',
                      color: wPorownaniu ? '#fff' : '#aaa',
                      cursor: maxOsiagniete ? 'not-allowed' : 'pointer',
                      fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,.15)', opacity: maxOsiagniete ? .4 : 1,
                    }}
                  >
                    {wPorownaniu ? '✓' : '+'}
                  </button>
                  <Link href={`/lokal/${l._id}`} style={{ textDecoration: 'none' }}>
                    <div className="lokal-card" style={{
                      background: '#fff', borderRadius: 14, overflow: 'hidden',
                      boxShadow: wPorownaniu ? '0 0 0 2px #4f7cff, 0 4px 16px rgba(79,124,255,.2)' : '0 2px 12px rgba(0,0,0,.06)',
                      borderTop: `3px solid ${c.dot}`, cursor: 'pointer',
                      transition: 'box-shadow .2s, transform .2s',
                    }}>
                      {thumb && (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
                          <Image src={`${thumb}?w=600&fit=crop&auto=format`} alt={`Apartament ${l.nr}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                      )}
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy }}>Apartament {l.nr}</div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                            {l.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 8px', marginBottom: 14 }}>
                          {[
                            ['Piętro',       l.pietro === 0 ? 'Parter' : l.pietro],
                            ['Pokoje',       l.pokoje],
                            ['Powierzchnia', `${l.powierzchnia} m²`],
                          ].map(([label, val]) => (
                            <div key={String(label)}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: .8 }}>{String(label).toUpperCase()}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{String(val)}</div>
                            </div>
                          ))}
                        </div>
                        {l.balkon?.typ && l.balkon.typ !== 'brak' && (
                          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>
                            {l.balkon.typ === 'balkon' ? '🌿 Balkon' : '🌱 Ogródek'}
                            {l.balkon.powierzchnia ? ` · ${l.balkon.powierzchnia} m²` : ''}
                          </div>
                        )}
                        <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy }}>{fmt(Math.round((l.cenaZaMetr ?? 0) * l.powierzchnia))}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{(l.cenaZaMetr ?? 0).toLocaleString('pl-PL')} zł/m²</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7f8fa', borderBottom: '2px solid #eee' }}>
                  {/* Checkbox col */}
                  <th style={{ padding: '12px 16px', width: 36 }} />
                  {([
                    { label: 'Nr',           col: 'nr'          as TableSortCol },
                    { label: 'Piętro',       col: 'pietro'      as TableSortCol },
                    { label: 'Pokoje',       col: 'pokoje'      as TableSortCol },
                    { label: 'Powierzchnia', col: 'powierzchnia'as TableSortCol },
                    { label: 'Cena',         col: 'cena'        as TableSortCol },
                    { label: 'Cena/m²',      col: 'cenaZaMetr'  as TableSortCol },
                  ] as { label: string; col: TableSortCol }[]).map(({ label, col }) => {
                    const active = tableSort.col === col
                    return (
                      <th
                        key={col}
                        onClick={() => handleTableSort(col)}
                        style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: active ? COLORS.navy : '#999', letterSpacing: 1, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                      >
                        {label}
                        <span style={{ marginLeft: 4, opacity: active ? 1 : 0.3 }}>
                          {active ? (tableSort.dir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </th>
                    )
                  })}
                  {/* Balkon, Status, action */}
                  {['Balkon', 'Status', ''].map((h, i) => (
                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabelaWyniki.map((l, i) => {
                  const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
                  const wPorownaniu = porownaj.includes(l._id)
                  const maxOsiagniete = porownaj.length >= 3 && !wPorownaniu
                  return (
                    <tr key={l._id} className="tabela-row" onClick={(e) => { if ((e.target as HTMLElement).closest('a, button')) return; router.push(`/lokal/${l._id}`) }} style={{ borderBottom: '1px solid #f0f0f0', background: wPorownaniu ? '#f0f4ff' : i % 2 === 0 ? '#fff' : '#fafafa', outline: wPorownaniu ? '2px solid #4f7cff' : 'none', outlineOffset: -2  }}>
                      <td style={{ padding: '10px 12px 10px 16px', width: 36 }}>
                        <button onClick={() => togglePorownaj(l._id)} disabled={maxOsiagniete} style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid', borderColor: wPorownaniu ? '#4f7cff' : '#ddd', background: wPorownaniu ? '#4f7cff' : '#fff', color: wPorownaniu ? '#fff' : 'transparent', cursor: maxOsiagniete ? 'not-allowed' : 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: maxOsiagniete ? .4 : 1 }}>
                          {wPorownaniu ? '✓' : ''}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: COLORS.navy }}>{l.nr}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.pietro === 0 ? 'Parter' : `${l.pietro} p.`}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.pokoje}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.powierzchnia} m²</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: COLORS.navy }}>{fmt(Math.round((l.cenaZaMetr ?? 0) * l.powierzchnia))}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{(l.cenaZaMetr ?? 0).toLocaleString('pl-PL')} zł</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>
                        {l.balkon?.typ && l.balkon.typ !== 'brak'
                          ? `${l.balkon.typ === 'balkon' ? '🌿' : '🌱'}${l.balkon.powierzchnia ? ` ${l.balkon.powierzchnia} m²` : ''}`
                          : '–'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link href={`/lokal/${l._id}`} style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, textDecoration: 'none', borderBottom: `1px solid ${COLORS.navy}`, whiteSpace: 'nowrap' }}>
                          Zobacz →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .lokal-card:hover {
          box-shadow: 0 8px 32px rgba(27,45,79,.18) !important;
          transform: translateY(-4px);
        }
        .pow-slider {
          position: absolute;
          width: calc(100% + 16px);
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          height: 4px;
          -webkit-appearance: none;
          background: transparent;
          pointer-events: none;
          margin: 0;
          padding: 0;
        }
        .pow-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid #1B2D4F;
          background: #fff;
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 1px 6px rgba(0,0,0,.18);
        }
        .pow-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2.5px solid #1B2D4F;
          background: #fff;
          cursor: pointer;
          pointer-events: all;
          box-shadow: 0 1px 6px rgba(0,0,0,.18);
        }
        .tabela-row {
          transition: background .15s;
          cursor: pointer;
        }
        .tabela-row:hover {
          background: #f0f4ff !important;
        }
      `}</style>

      <PasekPorownania
        wybrane={porownaj}
        lokale={lokale}
        onToggle={togglePorownaj}
        onOpen={() => setShowModal(true)}
        onClear={() => setPorownaj([])}
      />
    </section>
  )
}
