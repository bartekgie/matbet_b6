'use client'

import { useState } from 'react'

const C = {
  navy:   '#1B2D4F',
  red:    '#D93025',
  gray:   '#6B7280',
  border: '#dde1e7',
  bg:     '#f5f7fa',
}

const ZGODA_1 = `Mam świadomość prawa dostępu do treści moich danych i ich poprawiania. Mam świadomość, iż w każdej chwili mogę wystąpić o zaprzestanie przetwarzania podanych przeze mnie danych osobowych w celach marketingowych, co skutkować będzie usunięciem danych z baz wykorzystywanych w celach marketingowych. Wyrażam zgodę na prowadzenie korespondencji drogą elektroniczną, zgodnie z ustawą o świadczeniu usług drogą elektroniczną (tekst jedn. Dz. U. z 2016 r. poz. 1030, 1579), a także drogą telefoniczną.`

const ZGODA_2 = `Wyrażam zgodę na prowadzenie korespondencji drogą elektroniczną, zgodnie z ustawą o świadczeniu usług drogą elektroniczną (tekst jedn. Dz. U. z 2016 r. poz. 1030, 1579), a także drogą telefoniczną.`

const KLAUZULA = `Dane osobowe przetwarzane są zgodnie z art. 23 ust.1 pkt. 5 ustawy o ochronie danych osobowych (Dz. U. z 2015 r. poz. 2135, z późn. zm.) przez administratora danych, MATBET spółka z o.o. z siedzibą ul. Poznańska 75, 76-200 Słupsk, w celu przedstawienia oferty handlowej, a także w celach marketingowych. Zebrane dane osobowe są udostępniane współpracującym z MATBET spółka z o.o. podmiotom. Podanie danych osobowych MATBET spółce z o.o. jest dobrowolne, poprzez zaakceptowanie niżej wymienionych oświadczeń.`

type Fields = { imie: string; nazwisko: string; email: string; telefon: string; zapytanie: string }
type Status = 'idle' | 'sending' | 'ok' | 'error'

export default function FormularzSection() {
  const [form, setForm]   = useState<Fields>({ imie: '', nazwisko: '', email: '', telefon: '', zapytanie: '' })
  const [zgoda1, setZgoda1] = useState(false)
  const [zgoda2, setZgoda2] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | 'zgoda1' | 'zgoda2', string>>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.imie.trim())     e.imie     = 'Pole wymagane'
    if (!form.nazwisko.trim()) e.nazwisko = 'Pole wymagane'
    if (!form.email.trim() && !form.telefon.trim()) {
      e.email   = 'Podaj e-mail lub numer telefonu'
      e.telefon = 'Podaj e-mail lub numer telefonu'
    }
    if (!form.zapytanie.trim()) e.zapytanie = 'Pole wymagane'
    if (!zgoda1) e.zgoda1 = 'Zgoda wymagana'
    if (!zgoda2) e.zgoda2 = 'Zgoda wymagana'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStatus('sending')
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'ok' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px', borderRadius: 8,
    border: `1px solid ${err ? C.red : C.border}`,
    fontSize: 14, color: C.navy,
    background: '#fff', outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  })

  return (
    <section id="kontakt" style={{ background: C.bg, padding: '80px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px' }}>

        {/* Label */}
        <p style={{ fontSize: 12, letterSpacing: 2, color: C.red, fontWeight: 700, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          KONTAKT
        </p>

        {/* Tytuł */}
        <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: C.navy, textAlign: 'center', marginBottom: 8 }}>
          Zapytaj o lokal
        </h2>
        <p style={{ fontSize: 15, color: C.gray, textAlign: 'center', marginBottom: 48, maxWidth: 480, margin: '0 auto 48px' }}>
          Wypełnij formularz, a nasz doradca skontaktuje się z Tobą w ciągu 24 godzin.
        </p>

        {/* Formularz */}
        <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Imię + Nazwisko */}
          <div className="form-row">
            <div className="form-field">
              <label style={labelStyle}>Imię *</label>
              <input
                type="text" value={form.imie} onChange={set('imie')}
                placeholder="np. Jan"
                style={inputStyle(errors.imie)}
                onFocus={e => { e.currentTarget.style.borderColor = C.navy }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.imie ? C.red : C.border }}
              />
              {errors.imie && <span style={errStyle}>{errors.imie}</span>}
            </div>
            <div className="form-field">
              <label style={labelStyle}>Nazwisko *</label>
              <input
                type="text" value={form.nazwisko} onChange={set('nazwisko')}
                placeholder="np. Kowalski"
                style={inputStyle(errors.nazwisko)}
                onFocus={e => { e.currentTarget.style.borderColor = C.navy }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.nazwisko ? C.red : C.border }}
              />
              {errors.nazwisko && <span style={errStyle}>{errors.nazwisko}</span>}
            </div>
          </div>

          {/* E-mail + Telefon */}
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: C.gray, marginBottom: 10 }}>
              Podaj e-mail lub numer telefonu — wystarczy jedno pole *
            </p>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label style={labelStyle}>E-mail</label>
              <input
                type="email" value={form.email} onChange={set('email')}
                placeholder="jan.kowalski@email.pl"
                style={inputStyle(errors.email)}
                onFocus={e => { e.currentTarget.style.borderColor = C.navy }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.email ? C.red : C.border }}
              />
              {errors.email && <span style={errStyle}>{errors.email}</span>}
            </div>
            <div className="form-field">
              <label style={labelStyle}>Telefon</label>
              <input
                type="tel" value={form.telefon} onChange={set('telefon')}
                placeholder="np. 600 100 200"
                style={inputStyle(errors.telefon)}
                onFocus={e => { e.currentTarget.style.borderColor = C.navy }}
                onBlur={e => { e.currentTarget.style.borderColor = errors.telefon ? C.red : C.border }}
              />
              {errors.telefon && <span style={errStyle}>{errors.telefon}</span>}
            </div>
          </div>

          {/* Zapytanie */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Zapytanie *</label>
            <textarea
              value={form.zapytanie} onChange={set('zapytanie')}
              placeholder="Czym jesteś zainteresowany? Możesz podać konkretny numer lokalu lub opisać swoje oczekiwania..."
              rows={5}
              style={{ ...inputStyle(errors.zapytanie), resize: 'vertical', minHeight: 120 }}
              onFocus={e => { e.currentTarget.style.borderColor = C.navy }}
              onBlur={e => { e.currentTarget.style.borderColor = errors.zapytanie ? C.red : C.border }}
            />
            {errors.zapytanie && <span style={errStyle}>{errors.zapytanie}</span>}
          </div>

          {/* Zgody */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, marginBottom: 8 }}>
            <CheckboxField
              checked={zgoda1}
              onChange={setZgoda1}
              text={ZGODA_1}
              error={errors.zgoda1}
              onClearError={() => setErrors(p => { const n = { ...p }; delete n.zgoda1; return n })}
            />
            <CheckboxField
              checked={zgoda2}
              onChange={setZgoda2}
              text={ZGODA_2}
              error={errors.zgoda2}
              onClearError={() => setErrors(p => { const n = { ...p }; delete n.zgoda2; return n })}
            />
          </div>

          {/* Klauzula */}
          <p style={{ fontSize: 11, color: C.gray, lineHeight: 1.6, marginBottom: 32, padding: '12px 14px', background: '#eef0f4', borderRadius: 8, border: `1px solid ${C.border}` }}>
            {KLAUZULA}
          </p>

          {/* Submit */}
          {status === 'ok' ? (
            <div style={{ textAlign: 'center', padding: '20px', background: '#d1fae5', borderRadius: 10, color: '#065f46', fontWeight: 700, fontSize: 15 }}>
              Wiadomość wysłana! Odezwiemy się wkrótce.
            </div>
          ) : (
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%', padding: '15px 24px',
                background: status === 'sending' ? '#8a9ab5' : C.navy,
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: status === 'sending' ? 'default' : 'pointer',
                transition: 'background 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {status === 'sending' ? 'Wysyłanie...' : 'Wyślij zapytanie'}
            </button>
          )}
          {status === 'error' && (
            <p style={{ color: C.red, fontSize: 13, textAlign: 'center', marginTop: 12 }}>
              Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub zadzwoń do nas bezpośrednio.
            </p>
          )}
        </form>
      </div>

      <style>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .form-field { display: flex; flex-direction: column; }
        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: '#1B2D4F',
  letterSpacing: 0.5, marginBottom: 6, display: 'block',
  textTransform: 'uppercase',
}

const errStyle: React.CSSProperties = {
  fontSize: 11, color: '#D93025', marginTop: 4,
}

function CheckboxField({
  checked, onChange, text, error, onClearError,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  text: string
  error?: string
  onClearError: () => void
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => { onChange(e.target.checked); if (e.target.checked) onClearError() }}
          style={{ marginTop: 3, flexShrink: 0, accentColor: '#1B2D4F', width: 16, height: 16, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
          {text}
        </span>
      </label>
      {error && <p style={{ ...errStyle, marginTop: 4, marginLeft: 26 }}>{error}</p>}
    </div>
  )
}
