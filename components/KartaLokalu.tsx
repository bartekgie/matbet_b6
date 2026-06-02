'use client'

import Image from 'next/image'
import Link  from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Lokal } from '@/lib/types'

const C = {
  navy: '#1B2D4F',
  red:  '#A8423A',
  gold: '#D5A23F',
  bg:   '#FAF9F6',
}

const STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  wolne:      { bg: '#E8F5EE', text: '#2A6B48', dot: '#5A9E6F', label: 'Wolne'      },
  rezerwacja: { bg: '#FBF5E4', text: '#9A6E1A', dot: '#C9963A', label: 'Rezerwacja' },
  sprzedane:  { bg: '#F5EDEC', text: '#8B3530', dot: '#C05A54', label: 'Sprzedane'  },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n)

// ─── Stałe zgód (tożsame z FormularzSection) ────────────────────────────────
const ZGODA_1 = `Mam świadomość prawa dostępu do treści moich danych i ich poprawiania. Mam świadomość, iż w każdej chwili mogę wystąpić o zaprzestanie przetwarzania podanych przeze mnie danych osobowych w celach marketingowych, co skutkować będzie usunięciem danych z baz wykorzystywanych w celach marketingowych. Wyrażam zgodę na prowadzenie korespondencji drogą elektroniczną, zgodnie z ustawą o świadczeniu usług drogą elektroniczną (tekst jedn. Dz. U. z 2016 r. poz. 1030, 1579), a także drogą telefoniczną.`
const ZGODA_2 = `Wyrażam zgodę na prowadzenie korespondencji drogą elektroniczną, zgodnie z ustawą o świadczeniu usług drogą elektroniczną (tekst jedn. Dz. U. z 2016 r. poz. 1030, 1579), a także drogą telefoniczną.`
const KLAUZULA = `Dane osobowe przetwarzane są zgodnie z art. 23 ust.1 pkt. 5 ustawy o ochronie danych osobowych (Dz. U. z 2015 r. poz. 2135, z późn. zm.) przez administratora danych, MATBET spółka z o.o. z siedzibą ul. Poznańska 75, 76-200 Słupsk, w celu przedstawienia oferty handlowej, a także w celach marketingowych. Zebrane dane osobowe są udostępniane współpracującym z MATBET spółka z o.o. podmiotom. Podanie danych osobowych MATBET spółce z o.o. jest dobrowolne, poprzez zaakceptowanie niżej wymienionych oświadczeń.`

function ModalCheckbox({ checked, onChange, text, error, onClear }: {
  checked: boolean; onChange: (v: boolean) => void; text: string; error?: string; onClear: () => void
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
        <input type="checkbox" checked={checked}
          onChange={e => { onChange(e.target.checked); if (e.target.checked) onClear() }}
          style={{ marginTop: 3, flexShrink: 0, accentColor: C.navy, width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.6 }}>{text}</span>
      </label>
      {error && <p style={{ fontSize: 11, color: C.red, marginTop: 4, marginLeft: 26 }}>{error}</p>}
    </div>
  )
}

function KontaktModal({ lokal, onClose }: { lokal: Lokal; onClose: () => void }) {
  const [form, setForm] = useState({
    imie: '', nazwisko: '', email: '', telefon: '',
    zapytanie: `Jestem zainteresowany/a Lokalem ${lokal.nr} – ${lokal.budynek?.nazwa ?? 'Osiedle Nowe Miasto'}.\n`,
  })
  const [zgoda1, setZgoda1] = useState(false)
  const [zgoda2, setZgoda2] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.imie.trim())     e.imie     = 'Pole wymagane'
    if (!form.nazwisko.trim()) e.nazwisko = 'Pole wymagane'
    if (!form.email.trim() && !form.telefon.trim()) {
      e.email = 'Podaj e-mail lub numer telefonu'
      e.telefon = 'Podaj e-mail lub numer telefonu'
    }
    if (!form.zapytanie.trim()) e.zapytanie = 'Pole wymagane'
    if (!zgoda1) e.zgoda1 = 'Zgoda wymagana'
    if (!zgoda2) e.zgoda2 = 'Zgoda wymagana'
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lokalNr: lokal.nr, budynekNazwa: lokal.budynek?.nazwa }),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch { setStatus('error') }
  }

  const inp = (err?: string) => ({
    width: '100%', boxSizing: 'border-box' as const, padding: '11px 13px', borderRadius: 8,
    border: `1px solid ${err ? C.red : '#dde1e7'}`, fontSize: 14, color: C.navy,
    background: '#fff', outline: 'none', fontFamily: 'inherit',
  })
  const lbl = { fontSize: 12, fontWeight: 700, color: C.navy, letterSpacing: 0.5, marginBottom: 6, display: 'block', textTransform: 'uppercase' as const }
  const errS = { fontSize: 11, color: C.red, marginTop: 4, display: 'block' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: C.navy, borderRadius: '16px 16px 0 0', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Zapytaj o</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Lokal {lokal.nr}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Formularz */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: '28px 28px 24px' }}>
          <div className="km-grid">
            <div>
              <label style={lbl}>Imię *</label>
              <input type="text" value={form.imie} onChange={set('imie')} placeholder="Jan" style={inp(errors.imie)} onFocus={e => { e.currentTarget.style.borderColor = C.navy }} onBlur={e => { e.currentTarget.style.borderColor = errors.imie ? C.red : '#dde1e7' }} />
              {errors.imie && <span style={errS}>{errors.imie}</span>}
            </div>
            <div>
              <label style={lbl}>Nazwisko *</label>
              <input type="text" value={form.nazwisko} onChange={set('nazwisko')} placeholder="Kowalski" style={inp(errors.nazwisko)} onFocus={e => { e.currentTarget.style.borderColor = C.navy }} onBlur={e => { e.currentTarget.style.borderColor = errors.nazwisko ? C.red : '#dde1e7' }} />
              {errors.nazwisko && <span style={errS}>{errors.nazwisko}</span>}
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Podaj e-mail lub numer telefonu — wystarczy jedno pole *</p>
          <div className="km-grid">
            <div>
              <label style={lbl}>E-mail</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="jan@email.pl" style={inp(errors.email)} onFocus={e => { e.currentTarget.style.borderColor = C.navy }} onBlur={e => { e.currentTarget.style.borderColor = errors.email ? C.red : '#dde1e7' }} />
              {errors.email && <span style={errS}>{errors.email}</span>}
            </div>
            <div>
              <label style={lbl}>Telefon</label>
              <input type="tel" value={form.telefon} onChange={set('telefon')} placeholder="600 100 200" style={inp(errors.telefon)} onFocus={e => { e.currentTarget.style.borderColor = C.navy }} onBlur={e => { e.currentTarget.style.borderColor = errors.telefon ? C.red : '#dde1e7' }} />
              {errors.telefon && <span style={errS}>{errors.telefon}</span>}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={lbl}>Zapytanie *</label>
            <textarea value={form.zapytanie} onChange={set('zapytanie')} rows={4} style={{ ...inp(errors.zapytanie), resize: 'vertical', minHeight: 100 }} onFocus={e => { e.currentTarget.style.borderColor = C.navy }} onBlur={e => { e.currentTarget.style.borderColor = errors.zapytanie ? C.red : '#dde1e7' }} />
            {errors.zapytanie && <span style={errS}>{errors.zapytanie}</span>}
          </div>

          <div style={{ borderTop: '1px solid #dde1e7', paddingTop: 20, marginBottom: 8 }}>
            <ModalCheckbox checked={zgoda1} onChange={setZgoda1} text={ZGODA_1} error={errors.zgoda1} onClear={() => setErrors(p => { const n = {...p}; delete n.zgoda1; return n })} />
            <ModalCheckbox checked={zgoda2} onChange={setZgoda2} text={ZGODA_2} error={errors.zgoda2} onClear={() => setErrors(p => { const n = {...p}; delete n.zgoda2; return n })} />
          </div>

          <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6, marginBottom: 24, padding: '10px 12px', background: '#FAF9F6', borderRadius: 8, border: '1px solid #E8E0D5' }}>{KLAUZULA}</p>

          {status === 'ok' ? (
            <div style={{ textAlign: 'center', padding: '20px', background: '#d1fae5', borderRadius: 10, color: '#065f46', fontWeight: 700 }}>
              Wiadomość wysłana! Odezwiemy się wkrótce.
            </div>
          ) : (
            <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '14px 24px', background: status === 'sending' ? '#8a9ab5' : C.navy, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: status === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {status === 'sending' ? 'Wysyłanie...' : 'Wyślij zapytanie'}
            </button>
          )}
          {status === 'error' && (
            <p style={{ color: C.red, fontSize: 13, textAlign: 'center', marginTop: 12 }}>
              Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub zadzwoń do nas.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default function KartaLokalu({ lokal }: { lokal: Lokal }) {
  const router = useRouter()
  const s      = STATUS[lokal.status] || STATUS.wolne
  const cena   = Math.round((lokal.cenaZaMetr ?? 0) * lokal.powierzchnia)
  const hasPom = (lokal.pomieszczenia?.length ?? 0) > 0

  const [wPorownaniu, setWPorownaniu] = useState(false)
  const [maxOsiagniete, setMaxOsiagniete] = useState(false)
  const [printDate, setPrintDate] = useState('')
  const [showKontakt, setShowKontakt] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('porownaj') || '[]') as string[]
      setWPorownaniu(saved.includes(lokal._id))
      setMaxOsiagniete(saved.length >= 3 && !saved.includes(lokal._id))
    } catch {}
  }, [lokal._id])

  const togglePorownaj = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('porownaj') || '[]') as string[]
      let updated: string[]
      if (saved.includes(lokal._id)) {
        updated = saved.filter((id: string) => id !== lokal._id)
      } else {
        updated = saved.length >= 3 ? saved : [...saved, lokal._id]
      }
      localStorage.setItem('porownaj', JSON.stringify(updated))
      setWPorownaniu(updated.includes(lokal._id))
      setMaxOsiagniete(updated.length >= 3 && !updated.includes(lokal._id))
    } catch {}
  }

  type Stat = { label: string; val: string; gold?: boolean }
  const statsBasic: Stat[] = [
    { label: 'Powierzchnia', val: `${lokal.powierzchnia} m²` },
    { label: 'Pokoje',       val: String(lokal.pokoje) },
    { label: 'Piętro',       val: lokal.pietro === 0 ? 'Parter' : String(lokal.pietro) },
    ...(lokal.balkon?.typ && lokal.balkon.typ !== 'brak'
      ? [{ label: lokal.balkon.typ === 'balkon' ? 'Balkon' : 'Ogródek',
           val: lokal.balkon.powierzchnia ? `${lokal.balkon.powierzchnia} m²` : 'tak' }]
      : []),
  ]
  const statsPricing: Stat[] = [
    ...(lokal.cenaZaMetr ? [{ label: 'Cena/m²', val: `${lokal.cenaZaMetr.toLocaleString('pl-PL')} zł` }] : []),
    ...(lokal.cenaZaMetr ? [{ label: 'Cena',    val: fmt(cena), gold: true }] : []),
  ]

  return (
    <main style={{ background: C.bg, fontFamily: 'inherit', paddingTop: 96 }}>

      {showKontakt && <KontaktModal lokal={lokal} onClose={() => setShowKontakt(false)} />}

      {/* ── BREADCRUMB (ukryty w druku) ─────────────────────────────────── */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #eaecf0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px' }}>
          <button
            onClick={() => router.push(`/budynek/${lokal.budynek?.slug ?? ''}`, { scroll: false })}
            style={{ background: 'none', border: 'none', fontSize: 13, color: C.navy, fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            ← {lokal.budynek?.nazwa ?? 'Wróć'}
          </button>
        </div>
      </div>

      {/* ── KARTA ───────────────────────────────────────────────────────── */}
      <div className="kl-outer" style={{ maxWidth: 1100, margin: '20px auto', padding: '0 24px 32px' }}>
        <div id="karta-print" style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,.1)' }}>

          {/* Nagłówek karty */}
          <div className="kl-header" style={{ background: C.navy, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="kl-header-bldg" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
              {lokal.budynek?.nazwa ?? ''}
            </div>
            <div className="kl-header-title" style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.3 }}>
              Lokal {lokal.nr}
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.text, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
              {s.label}
            </span>
          </div>

          {/* Pasek parametrów */}
          <div className="kl-params-container" style={{ background: '#f8f9fb', borderBottom: '1px solid #eaecf0', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Dodaj do porównania — lewa strona paska */}
            <button
              onClick={togglePorownaj}
              disabled={maxOsiagniete}
              className="no-print kl-porownaj-btn"
              title={wPorownaniu ? 'Usuń z porównania' : maxOsiagniete ? 'Można porównać max 3 lokale' : 'Dodaj do porównania'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 16px', borderRadius: 20, flexShrink: 0,
                border: `1.5px solid ${wPorownaniu ? '#4f7cff' : '#ddd'}`,
                background: wPorownaniu ? '#4f7cff' : '#fff',
                color: wPorownaniu ? '#fff' : maxOsiagniete ? '#bbb' : C.navy,
                fontSize: 12, fontWeight: 600, cursor: maxOsiagniete ? 'not-allowed' : 'pointer',
                opacity: maxOsiagniete ? 0.5 : 1, transition: 'all .15s',
              }}
            >
              {wPorownaniu ? '✓ W porównaniu' : '+ Dodaj do porównania'}
            </button>
            {/* Parametry — prawa strona paska */}
            <div className="kl-params-right" style={{ display: 'flex' }}>
            {/* Podstawowe — desktop: inline, mobile: rząd 1 */}
            <div className="kl-params-basic" style={{ display: 'flex' }}>
              {statsBasic.map(({ label, val }) => (
                <div key={label} className="kl-param-item" style={{
                  padding: '12px 20px', textAlign: 'center', flexShrink: 0,
                  borderRight: '1px solid #dde1e7',
                }}>
                  <div style={{ fontSize: 8, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, whiteSpace: 'nowrap' }}>{val}</div>
                </div>
              ))}
            </div>
            {/* Ceny — desktop: inline po podstawowych, mobile: rząd 2 */}
            {statsPricing.length > 0 && (
              <div className="kl-params-pricing" style={{ display: 'flex' }}>
                {statsPricing.map(({ label, val, gold }, i) => (
                  <div key={label} className="kl-param-item" style={{
                    padding: '12px 20px', textAlign: 'center', flexShrink: 0,
                    borderRight: i < statsPricing.length - 1 ? '1px solid #dde1e7' : 'none',
                  }}>
                    <div style={{ fontSize: 8, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: gold ? C.gold : C.navy, whiteSpace: 'nowrap' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
            </div>{/* koniec wrappera prawej strony paska */}
          </div>

          {/* Rzut B + Legenda */}
          <div className={`kl-main${hasPom ? ' kl-has-pom' : ''}`} style={{ padding: '20px 28px 0', display: 'grid', gridTemplateColumns: hasPom ? '1fr 210px' : '1fr', gap: 20, alignItems: 'stretch' }}>

            {/* Rzut mieszkania B */}
            <div className="kl-rzut-col">
              <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Rzut mieszkania</div>
              {lokal.rzutUrl ? (
                <div className="kl-rzut-img-wrap" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#f9fafb', borderRadius: 8, overflow: 'hidden', border: '1px solid #eaecf0' }}>
                  <Image
                    src={`${lokal.rzutUrl}?auto=format`}
                    alt="Rzut mieszkania"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, 760px"
                  />
                  {lokal.budynek?.northUrl && (
                    <div style={{ position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, zIndex: 10, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.25))' }}>
                      <Image
                        src={`${lokal.budynek.northUrl}?auto=format&w=80`}
                        alt="Kierunek północy"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="52px"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ aspectRatio: '4/3', background: '#f9fafb', borderRadius: 8, border: '1px solid #eaecf0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>
                  Rzut zostanie dodany wkrótce
                </div>
              )}
            </div>

            {/* Legenda pomieszczeń */}
            {hasPom && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="kl-leg-label" style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Legenda</div>
                <table className="kl-leg-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.navy }}>
                      <th className="kl-leg-th" style={{ padding: '7px 10px', textAlign: 'left',  fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>LP</th>
                      <th className="kl-leg-th" style={{ padding: '7px 10px', textAlign: 'left',  fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>POMIESZCZENIE</th>
                      <th className="kl-leg-th" style={{ padding: '7px 10px', textAlign: 'right', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>POW.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lokal.pomieszczenia!.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td className="kl-leg-lp" style={{ padding: '7px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: '7px 10px', color: '#374151', fontWeight: 500 }}>{p.nazwa.replace('Salon z aneksem kuchennym', 'Salon z aneksem kuch.')}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', color: C.navy, fontWeight: 700, whiteSpace: 'nowrap' }}>{p.powierzchnia} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Rzut kondygnacji — pod legendą */}
                {lokal.rzutKondygnacjiUrl && (
                  <div style={{ marginTop: 16 }}>
                    <div className="kl-leg-label" style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Rzut kondygnacji</div>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: '#f9fafb', borderRadius: 8, overflow: 'hidden', border: '1px solid #eaecf0' }}>
                      <Image
                        src={`${lokal.rzutKondygnacjiUrl}?auto=format`}
                        alt="Rzut kondygnacji"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="260px"
                      />
                    </div>
                  </div>
                )}

                {/* Oznaczenia ścian — wypełnia resztę wysokości */}
                <div style={{
                  flexGrow: 1,
                  marginTop: 16,
                  background: '#f8f9fb',
                  borderRadius: 8,
                  border: '1px solid #eaecf0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 10,
                }}>
                  <div className="kl-leg-label" style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Oznaczenia</div>
                  {[
                    { label: 'Ściany nośne',    src: '/sciany nosne.png' },
                    { label: 'Ściany działowe', src: '/sciany dzialowe.png' },
                  ].map(({ label, src }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={src} alt={label} className="kl-leg-wall-img" style={{ width: 32, height: 16, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                      <span className="kl-leg-wall-label" style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stopka z zastrzeżeniami */}
          <div className="kl-footer" style={{ margin: '16px 28px 0', padding: '12px 16px', background: '#f8f9fb', borderRadius: 8, borderLeft: `3px solid #dde1e7` }}>
            <p style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
              Powierzchnię użytkową obliczono wg PN-ISO 9836-1997.<br />
              Projekt wykonawczy może wprowadzić zmiany.<br />
              Aranżacja pomieszczeń nie stanowi oferty handlowej w rozumieniu przepisów prawa, ma jedynie charakter poglądowy.
            </p>
          </div>

          {/* Stopka firmy — widoczna też w druku */}
          <div className="kl-firm-footer" style={{
            background: C.navy, borderRadius: 8,
            margin: '16px 28px 16px', padding: '14px 16px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo%20-%20Matbet%20-%20bia%C5%82e.png" alt="Matbet" style={{ height: 30, width: 'auto', flexShrink: 0 }} />
            <div className="kl-firm-footer-info" style={{
              display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end',
              color: 'rgba(255,255,255,0.7)', fontSize: 11,
            }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>MATBET Sp. z o.o.</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>ul. Poznańska 75, 76-200 Słupsk</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ color: '#fff' }}>+48 519 326 296</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>matbet@matbet.com.pl</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>matbet.com.pl</span>
            </div>
          </div>

          {/* Data wydruku — widoczna tylko w druku */}
          {printDate && (
            <div className="kl-print-date" style={{ display: 'none', margin: '0 28px 8px', padding: '6px 0', borderTop: '1px solid rgba(27,45,79,0.15)', fontSize: 10, color: '#9ca3af', textAlign: 'right' }}>
              Data wydruku: {printDate}
            </div>
          )}

        </div>

        {/* Przyciski akcji (ukryte w druku) */}
        <div className="no-print kl-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push(`/budynek/${lokal.budynek?.slug ?? ''}`, { scroll: false })}
            className="kl-btn"
            style={{
              padding: '12px 32px', borderRadius: 10,
              background: '#f3f4f6', color: C.navy,
              border: 'none', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', textAlign: 'center',
            }}
          >
            ← Wróć
          </button>
          <button
            onClick={() => setShowKontakt(true)}
            className="kl-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 32px', borderRadius: 10,
              background: C.red, color: '#fff',
              border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Skontaktuj się
          </button>
          <button
            onClick={() => {
              const d = new Intl.DateTimeFormat('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())
              setPrintDate(d)
              const prev = document.title
              document.title = `Lokal ${lokal.nr} - Osiedle Nowe Miasto - Budynek B6`
              window.addEventListener('afterprint', () => { document.title = prev }, { once: true })
              setTimeout(() => window.print(), 50)
            }}
            className="kl-btn"
            style={{
              padding: '12px 32px', borderRadius: 10,
              background: '#fff', color: C.navy,
              border: `2px solid ${C.navy}`,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Zobacz kartę PDF
          </button>
        </div>
      </div>

      <style>{`
        .kl-btn { transition: background 0.15s, transform 0.15s, box-shadow 0.15s, border-color 0.15s; }
        .kl-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(27,45,79,0.15); }
        .kl-porownaj-btn { transition: background 0.15s, transform 0.15s; }
        .kl-porownaj-btn:hover { transform: translateY(-1px); }
        .km-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        @media (max-width: 500px) { .km-grid { grid-template-columns: 1fr !important; } }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          nav        { display: none !important; }
          footer     { display: none !important; }
          main       { padding-top: 0 !important; background: #fff !important; }
          html       { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body       { zoom: 0.72; margin: 0 !important; transform-origin: top left; }
          @supports not (zoom: 1) {
            body { transform: scale(0.72); width: calc(100% / 0.72); }
          }
          .kl-outer  { max-width: 100% !important; margin: 0 !important; padding: 0 4px !important; }
          #karta-print {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            page-break-inside: avoid;
          }
          .kl-print-date { display: block !important; }
          @page { size: A4 landscape; margin: 8mm; }
        }
        @media (min-width: 769px) {
          .kl-has-pom { grid-template-columns: 1fr 252px !important; }
          .kl-has-pom .kl-rzut-col { display: flex; flex-direction: column; }
          .kl-has-pom .kl-rzut-img-wrap { flex-grow: 1; aspect-ratio: unset !important; min-height: 150px; }
          .kl-leg-label     { font-size: 11px !important; }
          .kl-leg-table     { font-size: 14px !important; }
          .kl-leg-th        { font-size: 10px !important; padding: 8px 12px !important; }
          .kl-leg-lp        { font-size: 13px !important; }
          .kl-leg-wall-img  { width: 38px !important; height: 19px !important; }
          .kl-leg-wall-label{ font-size: 13px !important; }
        }
        @media (max-width: 768px) {
          main { padding-top: 80px !important; }
          .kl-outer { padding: 0 10px 20px !important; margin: 10px auto !important; }
          .kl-header { padding: 10px 14px !important; flex-wrap: wrap; gap: 6px 10px; }
          .kl-header-title { font-size: 18px !important; order: -1; width: 100%; text-align: center; }
          .kl-header-bldg { font-size: 9px !important; }
          .kl-main { grid-template-columns: 1fr !important; padding: 14px 14px 0 !important; }
          .kl-footer { margin: 12px 14px 0 !important; }
          .kl-btns { flex-direction: column !important; align-items: stretch !important; }
          .kl-btn { width: 100% !important; box-sizing: border-box !important; text-align: center !important; justify-content: center !important; }
          .kl-param-item { padding: 10px 10px !important; }
          .kl-params-container { flex-direction: column !important; padding: 0 14px !important; align-items: stretch !important; }
          .kl-porownaj-btn { width: 100% !important; justify-content: center !important; margin: 10px 0 !important; }
          .kl-params-right { flex-direction: column !important; width: 100% !important; }
          .kl-params-basic { width: 100% !important; }
          .kl-params-basic .kl-param-item { flex: 1 1 0 !important; flex-shrink: 1 !important; min-width: 0 !important; }
          .kl-params-basic .kl-param-item:last-child { border-right: none !important; }
          .kl-params-pricing { border-top: 1px solid #dde1e7 !important; width: 100% !important; }
          .kl-params-pricing .kl-param-item { flex: 1 1 0 !important; flex-shrink: 1 !important; min-width: 0 !important; border-right: none !important; }
          .kl-params-pricing .kl-param-item:first-child { border-right: 1px solid #dde1e7 !important; }
          .kl-firm-footer { flex-direction: column !important; align-items: center !important; text-align: center !important; margin: 12px 14px 14px !important; }
          .kl-firm-footer-info { justify-content: center !important; }
        }
      `}</style>
    </main>
  )
}
