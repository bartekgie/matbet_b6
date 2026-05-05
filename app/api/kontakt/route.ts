import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { imie, nazwisko, email, telefon, zapytanie, lokalNr, budynekNazwa } = await req.json()

    const subject = lokalNr
      ? `Lokal ${lokalNr} (${budynekNazwa ?? 'Budynek B6'}) – zapytanie od ${imie} ${nazwisko}`
      : `Zapytanie o lokal – ${imie} ${nazwisko}`

    const { error } = await resend.emails.send({
      from:    'Formularz Budynek B6 <onboarding@resend.dev>',
      to:      [process.env.MAIL_TO || 'bartosz.giecewicz@gmail.com'],
      subject,
      html: `
        <h2 style="color:#1B2D4F">Nowe zapytanie z formularza</h2>
        <table style="border-collapse:collapse;width:100%;max-width:500px">
          ${lokalNr ? `<tr><td style="padding:8px 12px;background:#1B2D4F;color:#fff;font-weight:700;width:120px">Lokal</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:700">${lokalNr} – ${budynekNazwa ?? ''}</td></tr>` : ''}
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:600;width:120px">Imię</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${imie}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:600">Nazwisko</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${nazwisko}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:600">E-mail</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${email || '—'}</td></tr>
          <tr><td style="padding:8px 12px;background:#f5f7fa;font-weight:600">Telefon</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${telefon || '—'}</td></tr>
        </table>
        <h3 style="color:#1B2D4F;margin-top:20px">Zapytanie</h3>
        <p style="white-space:pre-wrap;background:#f5f7fa;padding:12px;border-radius:6px">${zapytanie}</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Mail error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
