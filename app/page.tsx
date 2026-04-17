'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/sanity'

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  wolne:      { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50' },
  rezerwacja: { bg: '#fff8e1', text: '#f57f17', dot: '#ffc107' },
  sprzedane:  { bg: '#fce4ec', text: '#c62828', dot: '#ef5350' },
}

const fmt = (cena: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(cena)

const INIT_FILTRY = { pokoje: '', pietro: '', status: '', budynek: '' }

type Sortowanie = 'cena_asc' | 'cena_desc' | 'pow_asc' | 'pow_desc'
type Widok = 'kafelki' | 'tabela'

const SORT_OPCJE: { value: Sortowanie; label: string }[] = [
  { value: 'cena_asc',  label: 'Cena: od najniższej' },
  { value: 'cena_desc', label: 'Cena: od najwyższej' },
  { value: 'pow_asc',   label: 'Powierzchnia: od najmniejszej' },
  { value: 'pow_desc',  label: 'Powierzchnia: od największej' },
]

function sortuj(lista: any[], sort: Sortowanie) {
  return [...lista].sort((a, b) => {
    if (sort === 'cena_asc')  return a.cena - b.cena
    if (sort === 'cena_desc') return b.cena - a.cena
    if (sort === 'pow_asc')   return a.powierzchnia - b.powierzchnia
    if (sort === 'pow_desc')  return b.powierzchnia - a.powierzchnia
    return 0
  })
}

// ─── Ikony ────────────────────────────────────────────────────────────────────
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

// ─── Modal porównywarki ───────────────────────────────────────────────────────
function Porownywarka({ lokale, onClose }: { lokale: any[]; onClose: () => void }) {
  const n = lokale.length

  // Pomocnicze: najlepsza wartość w danej kolumnie (niższa cena = lepsza, więcej m² = lepsze)
  const best = (vals: number[], preferMin: boolean) => {
    const fn = preferMin ? Math.min : Math.max
    return fn(...vals)
  }

  const ceny      = lokale.map(l => l.cena)
  const pow       = lokale.map(l => l.powierzchnia)
  const cenaNaM2  = lokale.map(l => Math.round(l.cena / l.powierzchnia))
  const bestCena  = best(ceny, true)
  const bestPow   = best(pow, false)
  const bestCenaM = best(cenaNaM2, true)

  const highlightStyle = (isBest: boolean): React.CSSProperties => isBest
    ? { background: '#e8f5e9', color: '#2e7d32', fontWeight: 700, borderRadius: 8, padding: '4px 8px' }
    : { padding: '4px 8px' }

  const ROWS: { label: string; render: (l: any, i: number) => React.ReactNode }[] = [
    {
      label: 'Zdjęcie',
      render: (l) => {
        const thumb = l.thumb || l.thumbRzut
        return thumb ? (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
            <Image src={`${thumb}?w=400&fit=crop&auto=format`} alt={`Apt. ${l.nr}`} fill style={{ objectFit: 'cover' }} sizes="33vw" />
          </div>
        ) : (
          <div style={{ aspectRatio: '4/3', background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>
            Brak zdjęcia
          </div>
        )
      }
    },
    { label: 'Numer', render: (l) => <strong style={{ fontSize: 16 }}>Apt. {l.nr}</strong> },
    { label: 'Status', render: (l) => {
        const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.text, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
            {l.status}
          </span>
        )
      }
    },
    { label: 'Budynek',      render: (l) => `Bud. ${l.budynek}` },
    { label: 'Piętro',       render: (l) => l.pietro === 0 ? 'Parter' : `${l.pietro} p.` },
    { label: 'Pokoje',       render: (l) => `${l.pokoje} ${l.pokoje === 1 ? 'pokój' : 'pokoje'}` },
    {
      label: 'Powierzchnia',
      render: (l) => <span style={highlightStyle(l.powierzchnia === bestPow)}>{l.powierzchnia} m²</span>
    },
    {
      label: 'Cena',
      render: (l) => <span style={highlightStyle(l.cena === bestCena)}>{fmt(l.cena)}</span>
    },
    {
      label: 'Cena / m²',
      render: (l) => {
        const v = Math.round(l.cena / l.powierzchnia)
        return <span style={highlightStyle(v === bestCenaM)}>{v.toLocaleString('pl-PL')} zł</span>
      }
    },
    { label: 'Balkon', render: (l) => l.balkon ? <span style={{ color: '#2e7d32', fontWeight: 700 }}>✓ Tak</span> : <span style={{ color: '#aaa' }}>–</span> },
    {
      label: '',
      render: (l) => (
        <Link href={`/lokal/${l._id}`} style={{
          display: 'inline-block', padding: '8px 18px', borderRadius: 20,
          background: '#1a1a2e', color: '#fff', textDecoration: 'none',
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
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 900,
        boxShadow: '0 24px 80px rgba(0,0,0,.3)', overflow: 'hidden',
      }}>
        {/* Nagłówek modala */}
        <div style={{
          background: '#1a1a2e', color: '#fff', padding: '18px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: 16 }}>Porównanie lokali</span>
            <span style={{ marginLeft: 10, fontSize: 12, color: '#8888aa' }}>
              {n} {n === 1 ? 'lokal' : n < 5 ? 'lokale' : 'lokali'}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff',
            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>

        {/* Legenda */}
        <div style={{ padding: '10px 28px', background: '#f7f8fa', borderBottom: '1px solid #eee', fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#e8f5e9', borderRadius: 3, border: '1px solid #b2dfdb' }} />
          Najlepsza wartość w porównaniu
        </div>

        {/* Tabela porównania */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr
                  key={ri}
                  style={{ borderBottom: '1px solid #f0f0f0', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                >
                  {row.label && (
                    <td style={{
                      padding: '14px 20px', width: 130, minWidth: 110,
                      fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: .8,
                      verticalAlign: 'middle',
                    }}>
                      {row.label.toUpperCase()}
                    </td>
                  )}
                  {!row.label && <td style={{ width: 130 }} />}
                  {lokale.map((l, li) => (
                    <td
                      key={l._id}
                      style={{
                        padding: '14px 20px', verticalAlign: 'middle',
                        borderLeft: '1px solid #f0f0f0',
                        textAlign: 'center',
                        color: '#333',
                      }}
                    >
                      {row.render(l, li)}
                    </td>
                  ))}
                  {/* Puste kolumny do 3 */}
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

// ─── Pasek porównywarki (sticky bottom) ───────────────────────────────────────
function PasekPorownania({
  wybrane, lokale, onToggle, onOpen, onClear,
}: {
  wybrane: string[]
  lokale: any[]
  onToggle: (id: string) => void
  onOpen: () => void
  onClear: () => void
}) {
  if (wybrane.length === 0) return null
  const wybraneObiekty = wybrane.map(id => lokale.find(l => l._id === id)).filter(Boolean)

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 900,
      background: '#1a1a2e', color: '#fff',
      boxShadow: '0 -4px 24px rgba(0,0,0,.25)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 12, color: '#8888aa', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>
          PORÓWNAJ ({wybrane.length}/3)
        </span>

        {/* Sloty */}
        <div style={{ display: 'flex', gap: 10, flex: 1, flexWrap: 'wrap' }}>
          {wybraneObiekty.map((l: any) => (
            <div key={l._id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '6px 12px',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Apt. {l.nr}</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>{l.powierzchnia} m²</span>
              <button onClick={() => onToggle(l._id)} style={{
                background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2,
              }}>
                ✕
              </button>
            </div>
          ))}
          {/* Puste sloty */}
          {Array.from({ length: 3 - wybraneObiekty.length }).map((_, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 120, height: 36, borderRadius: 10,
              border: '1.5px dashed rgba(255,255,255,.2)', color: 'rgba(255,255,255,.3)',
              fontSize: 12,
            }}>
              + dodaj lokal
            </div>
          ))}
        </div>

        {/* Przyciski */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClear} style={{
            padding: '8px 16px', borderRadius: 20, border: '1.5px solid rgba(255,255,255,.2)',
            background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 13,
          }}>
            Wyczyść
          </button>
          <button
            onClick={onOpen}
            disabled={wybrane.length < 2}
            style={{
              padding: '8px 20px', borderRadius: 20, border: 'none',
              background: wybrane.length >= 2 ? '#4f7cff' : 'rgba(255,255,255,.1)',
              color: wybrane.length >= 2 ? '#fff' : '#555',
              cursor: wybrane.length >= 2 ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 700,
              transition: 'background .15s',
            }}
          >
            Porównaj →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Główny komponent ─────────────────────────────────────────────────────────
export default function Home() {
  const [lokale, setLokale]             = useState<any[]>([])
  const [filtry, setFiltry]             = useState(INIT_FILTRY)
  const [sortowanie, setSortowanie]     = useState<Sortowanie>('cena_asc')
  const [widok, setWidok]               = useState<Widok>('kafelki')
  const [loading, setLoading]           = useState(true)
  const [porownaj, setPorownaj]         = useState<string[]>([])
  const [showPorownanie, setShowPorownanie] = useState(false)

  useEffect(() => {
    client.fetch(`*[_type == "lokal"]{
      _id, nr, budynek, pietro, pokoje, powierzchnia, cena, status, balkon,
      "thumb": zdjecia[0].asset->url,
      "thumbRzut": rzut.asset->url
    }`).then(data => {
      setLokale(data)
      setLoading(false)
    })
  }, [])

  // Zablokuj scroll gdy modal otwarty
  useEffect(() => {
    document.body.style.overflow = showPorownanie ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showPorownanie])

  const togglePorownaj = (id: string) => {
    setPorownaj(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const przefiltrowane = useMemo(() => {
    const filtered = lokale.filter(l => {
      if (filtry.pokoje  && l.pokoje  !== Number(filtry.pokoje))  return false
      if (filtry.pietro  && l.pietro  !== Number(filtry.pietro))  return false
      if (filtry.status  && l.status  !== filtry.status)          return false
      if (filtry.budynek && l.budynek !== filtry.budynek)          return false
      return true
    })
    return sortuj(filtered, sortowanie)
  }, [lokale, filtry, sortowanie])

  const pietra   = [...new Set(lokale.map(l => l.pietro))].sort((a, b) => a - b)
  const pokojeOp = [...new Set(lokale.map(l => l.pokoje))].sort((a, b) => a - b)
  const budynki  = [...new Set(lokale.map(l => l.budynek))].sort()

  const select = (key: string, val: string) =>
    setFiltry(f => ({ ...f, [key]: f[key as keyof typeof f] === val ? '' : val }))

  const chipStyle = (active: boolean) => ({
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
    borderColor: active ? '#1a1a2e' : '#ddd',
    background: active ? '#1a1a2e' : '#fff',
    color: active ? '#fff' : '#444',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  } as React.CSSProperties)

  const wybraneObiekty = porownaj.map(id => lokale.find(l => l._id === id)).filter(Boolean)

  if (loading) return <div style={{ padding: 32, fontFamily: 'sans-serif' }}>Ładowanie...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif', paddingBottom: porownaj.length > 0 ? 90 : 0 }}>

      {/* MODAL PORÓWNANIA */}
      {showPorownanie && (
        <Porownywarka lokale={wybraneObiekty} onClose={() => setShowPorownanie(false)} />
      )}

      {/* HEADER */}
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 17 }}>Osiedle Testowe</span>
          <span style={{ marginLeft: 12, fontSize: 12, color: '#8888aa' }}>Wyszukiwarka lokali</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* FILTRY */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>LICZBA POKOI</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {pokojeOp.map(p => (
                  <button key={p} style={chipStyle(filtry.pokoje === String(p))} onClick={() => select('pokoje', String(p))}>
                    {p} {p === 1 ? 'pokój' : 'pokoje'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>PIĘTRO</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {pietra.map(p => (
                  <button key={p} style={chipStyle(filtry.pietro === String(p))} onClick={() => select('pietro', String(p))}>
                    {p === 0 ? 'Parter' : `${p} p.`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>STATUS</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['wolne', 'rezerwacja', 'sprzedane'].map(s => (
                  <button key={s} style={chipStyle(filtry.status === s)} onClick={() => select('status', s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {budynki.length > 1 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 8, letterSpacing: 1 }}>BUDYNEK</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {budynki.map(b => (
                    <button key={b} style={chipStyle(filtry.budynek === b)} onClick={() => select('budynek', b)}>
                      Bud. {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {Object.values(filtry).some(Boolean) && (
              <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                <button onClick={() => setFiltry(INIT_FILTRY)} style={{
                  padding: '6px 14px', borderRadius: 20, border: '1.5px solid #eee',
                  background: '#f9f9f9', color: '#999', cursor: 'pointer', fontSize: 13,
                }}>
                  ✕ Wyczyść filtry
                </button>
              </div>
            )}

          </div>
        </div>

        {/* PASEK: licznik + sortowanie + widok */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>

          <div style={{ color: '#888', fontSize: 13, flex: 1, minWidth: 160 }}>
            Znaleziono <strong style={{ color: '#1a1a2e' }}>{przefiltrowane.length}</strong> lokali
            {Object.values(filtry).some(Boolean) && ` (z ${lokale.length} wszystkich)`}
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
              {SORT_OPCJE.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#999', letterSpacing: 1, whiteSpace: 'nowrap' }}>WIDOK</span>
            <div style={{ display: 'flex', borderRadius: 20, border: '1.5px solid #ddd', overflow: 'hidden' }}>
              {(['kafelki', 'tabela'] as Widok[]).map(w => (
                <button
                  key={w}
                  onClick={() => setWidok(w)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    background: widok === w ? '#1a1a2e' : '#fff',
                    color: widok === w ? '#fff' : '#666',
                  }}
                >
                  {w === 'kafelki' ? <IkonaKafelki /> : <IkonaTabela />}
                  {w.charAt(0).toUpperCase() + w.slice(1)}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* WYNIKI */}
        {przefiltrowane.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            Brak lokali spełniających kryteria
          </div>
        ) : widok === 'kafelki' ? (

          // ── KAFELKI ────────────────────────────────────────────────────────
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {przefiltrowane.map(l => {
              const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
              const thumb = l.thumb || l.thumbRzut
              const wPorownaniu = porownaj.includes(l._id)
              const maxOsiagniete = porownaj.length >= 3 && !wPorownaniu
              return (
                <div key={l._id} style={{ position: 'relative' }}>
                  {/* Przycisk porównaj */}
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
                      boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                      opacity: maxOsiagniete ? .4 : 1,
                    }}
                  >
                    {wPorownaniu ? '✓' : '+'}
                  </button>

                  <Link href={`/lokal/${l._id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fff', borderRadius: 14, overflow: 'hidden',
                      boxShadow: wPorownaniu ? '0 0 0 2px #4f7cff, 0 4px 16px rgba(79,124,255,.2)' : '0 2px 12px rgba(0,0,0,.06)',
                      borderTop: `3px solid ${c.dot}`,
                      cursor: 'pointer',
                      transition: 'box-shadow .15s',
                    }}>
                      {thumb && (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
                          <Image
                            src={`${thumb}?w=600&fit=crop&auto=format`}
                            alt={`Apt. ${l.nr}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Apt. {l.nr}</div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: c.bg, color: c.text,
                            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                            {l.status}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
                          {[
                            ['Piętro',       l.pietro === 0 ? 'Parter' : l.pietro],
                            ['Pokoje',       l.pokoje],
                            ['Powierzchnia', `${l.powierzchnia} m²`],
                            ['Budynek',      `Bud. ${l.budynek}`],
                          ].map(([label, val]) => (
                            <div key={String(label)}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: .8 }}>{String(label).toUpperCase()}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{String(val)}</div>
                            </div>
                          ))}
                        </div>
                        {l.balkon && <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>🌿 Balkon / taras</div>}
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{fmt(l.cena)}</div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                          {Math.round(l.cena / l.powierzchnia).toLocaleString('pl-PL')} zł/m²
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>

        ) : (

          // ── TABELA ─────────────────────────────────────────────────────────
          <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f7f8fa', borderBottom: '2px solid #eee' }}>
                  {['', 'Nr', 'Budynek', 'Piętro', 'Pokoje', 'Powierzchnia', 'Cena', 'Cena/m²', 'Balkon', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: 1,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {przefiltrowane.map((l, i) => {
                  const c = STATUS_COLORS[l.status] || STATUS_COLORS.wolne
                  const wPorownaniu = porownaj.includes(l._id)
                  const maxOsiagniete = porownaj.length >= 3 && !wPorownaniu
                  return (
                    <tr
                      key={l._id}
                      style={{
                        borderBottom: '1px solid #f0f0f0',
                        background: wPorownaniu ? '#f0f4ff' : i % 2 === 0 ? '#fff' : '#fafafa',
                        outline: wPorownaniu ? '2px solid #4f7cff' : 'none',
                        outlineOffset: -2,
                      }}
                    >
                      {/* Checkbox porównania */}
                      <td style={{ padding: '10px 12px 10px 16px', width: 36 }}>
                        <button
                          onClick={() => togglePorownaj(l._id)}
                          disabled={maxOsiagniete}
                          title={wPorownaniu ? 'Usuń z porównania' : maxOsiagniete ? 'Max 3 lokale' : 'Dodaj do porównania'}
                          style={{
                            width: 22, height: 22, borderRadius: 6, border: '2px solid',
                            borderColor: wPorownaniu ? '#4f7cff' : '#ddd',
                            background: wPorownaniu ? '#4f7cff' : '#fff',
                            color: wPorownaniu ? '#fff' : 'transparent',
                            cursor: maxOsiagniete ? 'not-allowed' : 'pointer',
                            fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: maxOsiagniete ? .4 : 1,
                          }}
                        >
                          {wPorownaniu ? '✓' : ''}
                        </button>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a1a2e' }}>{l.nr}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>Bud. {l.budynek}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.pietro === 0 ? 'Parter' : `${l.pietro} p.`}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.pokoje}</td>
                      <td style={{ padding: '12px 16px', color: '#555' }}>{l.powierzchnia} m²</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a1a2e' }}>{fmt(l.cena)}</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{Math.round(l.cena / l.powierzchnia).toLocaleString('pl-PL')} zł</td>
                      <td style={{ padding: '12px 16px', color: '#888' }}>{l.balkon ? '✓' : '–'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: c.bg, color: c.text,
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
                          {l.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link href={`/lokal/${l._id}`} style={{
                          fontSize: 12, fontWeight: 600, color: '#1a1a2e',
                          textDecoration: 'none', borderBottom: '1px solid #1a1a2e',
                          whiteSpace: 'nowrap',
                        }}>
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

      {/* PASEK PORÓWNANIA (sticky bottom) */}
      <PasekPorownania
        wybrane={porownaj}
        lokale={lokale}
        onToggle={togglePorownaj}
        onOpen={() => setShowPorownanie(true)}
        onClear={() => setPorownaj([])}
      />

    </div>
  )
}
