'use client'

import Image from 'next/image'
import Link  from 'next/link'
import { Lokal } from '@/lib/types'

const C = {
  navy: '#1B2D4F',
  red:  '#D93025',
  gold: '#C9973A',
  bg:   '#f5f7fa',
}

const STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  wolne:      { bg: '#e8f5e9', text: '#2e7d32', dot: '#4caf50', label: 'Wolne'      },
  rezerwacja: { bg: '#fff8e1', text: '#f57f17', dot: '#ffc107', label: 'Rezerwacja' },
  sprzedane:  { bg: '#fce4ec', text: '#c62828', dot: '#ef5350', label: 'Sprzedane'  },
}

const fmt = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(n)

export default function KartaLokalu({ lokal }: { lokal: Lokal }) {
  const s        = STATUS[lokal.status] || STATUS.wolne
  const cena     = Math.round((lokal.cenaZaMetr ?? 0) * lokal.powierzchnia)
  const hasPom = (lokal.pomieszczenia?.length ?? 0) > 0

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
    <main style={{ background: C.bg, fontFamily: 'sans-serif', paddingTop: 80 }}>

      {/* ── BREADCRUMB (ukryty w druku) ─────────────────────────────────── */}
      <div className="no-print" style={{ background: '#fff', borderBottom: '1px solid #eaecf0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link
            href={lokal.budynek?.slug ? `/budynek/${lokal.budynek.slug}` : '/'}
            style={{ fontSize: 13, color: C.navy, textDecoration: 'none', fontWeight: 600 }}
          >
            ← {lokal.budynek?.nazwa ?? 'Wróć'}
          </Link>
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
              Apartament {lokal.nr}
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.text, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
              {s.label}
            </span>
          </div>

          {/* Pasek parametrów */}
          <div className="kl-params-container" style={{ background: '#f8f9fb', borderBottom: '1px solid #eaecf0', padding: '0 28px', display: 'flex', justifyContent: 'flex-end' }}>
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
                <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Legenda</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.navy }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left',  fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>LP</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left',  fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>POMIESZCZENIE</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: 0.8 }}>POW.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lokal.pomieszczenia!.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '7px 10px', color: '#9ca3af', fontWeight: 600, fontSize: 11 }}>{i + 1}</td>
                        <td style={{ padding: '7px 10px', color: '#374151', fontWeight: 500 }}>{p.nazwa.replace('Salon z aneksem kuchennym', 'Salon z aneksem kuch.')}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', color: C.navy, fontWeight: 700, whiteSpace: 'nowrap' }}>{p.powierzchnia} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Rzut kondygnacji — pod legendą */}
                {lokal.rzutKondygnacjiUrl && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Rzut kondygnacji</div>
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
                  <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700, marginBottom: 2 }}>Oznaczenia</div>
                  {[
                    {
                      label: 'Ściany nośne',
                      swatch: {
                        background: 'repeating-linear-gradient(45deg, #1B2D4F 0px, #1B2D4F 3px, #4a6080 3px, #4a6080 6px)',
                        border: '1px solid #1B2D4F',
                      },
                    },
                    {
                      label: 'Ściany działowe',
                      swatch: {
                        background: '#e5e7eb',
                        border: '1px solid #9ca3af',
                      },
                    },
                  ].map(({ label, swatch }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 16, borderRadius: 3, flexShrink: 0, ...swatch }} />
                      <span style={{ fontSize: 11, color: '#374151', fontWeight: 500 }}>{label}</span>
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

          {/* Spacer dolny */}
          <div style={{ height: 24 }} />

        </div>

        {/* Przyciski akcji (ukryte w druku) */}
        <div className="no-print kl-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <Link
            href={lokal.budynek?.slug ? `/budynek/${lokal.budynek.slug}` : '/'}
            className="kl-btn"
            style={{
              padding: '12px 32px', borderRadius: 10,
              background: '#f3f4f6', color: C.navy,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
              textAlign: 'center',
            }}
          >
            ← Wróć
          </Link>
          <a
            href="mailto:biuro@matbet.pl"
            className="kl-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 32px', borderRadius: 10,
              background: C.navy, color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}
          >
            Skontaktuj się
          </a>
          <button
            onClick={() => window.print()}
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
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          nav        { display: none !important; }
          footer     { display: none !important; }
          main       { padding-top: 0 !important; background: #fff !important; }
          #karta-print {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
          @page { margin: 10mm; size: A4 portrait; }
        }
        @media (min-width: 769px) {
          .kl-has-pom .kl-rzut-col { display: flex; flex-direction: column; }
          .kl-has-pom .kl-rzut-img-wrap { flex-grow: 1; aspect-ratio: unset !important; min-height: 150px; }
        }
        @media (max-width: 768px) {
          .kl-outer { padding: 0 10px 20px !important; margin: 10px auto !important; }
          .kl-header { padding: 10px 14px !important; flex-wrap: wrap; gap: 6px 10px; }
          .kl-header-title { font-size: 18px !important; order: -1; width: 100%; text-align: center; }
          .kl-header-bldg { font-size: 9px !important; }
          .kl-main { grid-template-columns: 1fr !important; padding: 14px 14px 0 !important; }
          .kl-footer { margin: 12px 14px 0 !important; }
          .kl-btns { flex-direction: column !important; align-items: stretch !important; }
          .kl-btn { width: 100% !important; box-sizing: border-box !important; text-align: center !important; justify-content: center !important; }
          .kl-param-item { padding: 10px 10px !important; }
          .kl-params-container { flex-direction: column !important; padding: 0 14px !important; }
          .kl-params-basic { width: 100%; }
          .kl-params-basic .kl-param-item { flex: 1; }
          .kl-params-basic .kl-param-item:last-child { border-right: none !important; }
          .kl-params-pricing { border-top: 1px solid #dde1e7; justify-content: flex-end; }
        }
      `}</style>
    </main>
  )
}
