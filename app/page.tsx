import Link from 'next/link'
import { client } from '@/lib/client'
import { WSZYSTKIE_BUDYNKI_QUERY } from '@/lib/queries'

const COLORS = {
  navy: '#1B2D4F',
  gold: '#D5A23F',
  bg: '#FAF9F6',
  section: '#F4EFE6',
}

export default async function Home() {
  const budynki: { _id: string; nazwa: string; slug: string }[] = await client.fetch(WSZYSTKIE_BUDYNKI_QUERY)

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', fontFamily: 'var(--font-body, sans-serif)' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 12, letterSpacing: 2, color: COLORS.gold, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Matbet Deweloper</p>
        <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: COLORS.navy, marginBottom: 12 }}>Osiedle Nowe Miasto</h1>
        <p style={{ fontSize: 16, color: '#6B7280' }}>Wybierz budynek, żeby zobaczyć dostępne lokale</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', maxWidth: 900, width: '100%' }}>
        {budynki.map(b => (
          <Link
            key={b._id}
            href={`/budynek/${b.slug}`}
            style={{
              flex: '1 1 260px', maxWidth: 320,
              background: COLORS.section, borderRadius: 16,
              padding: '40px 32px', textAlign: 'center',
              textDecoration: 'none', border: `1px solid ${COLORS.navy}22`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{ fontSize: 12, letterSpacing: 1.5, color: COLORS.gold, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Budynek</div>
            <div style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 26, fontWeight: 700, color: COLORS.navy, marginBottom: 16 }}>{b.nazwa}</div>
            <span style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 24, background: COLORS.navy, color: '#fff', fontSize: 14, fontWeight: 600 }}>
              Zobacz lokale →
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
