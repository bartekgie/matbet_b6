import { client } from '@/lib/sanity'
import { LOKAL_QUERY } from '@/lib/queries'
import { notFound } from 'next/navigation'
import Navbar      from '@/components/Navbar'
import KartaLokalu from '@/components/KartaLokalu'
import Footer      from '@/components/Footer'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lokal = await client.fetch(LOKAL_QUERY, { id })
  if (!lokal) return {}

  const budynekNazwa = lokal.budynek?.nazwa ?? 'Matbet'
  const budynekSlug  = lokal.budynek?.slug ?? ''
  const pokoje = lokal.pokoje === 1 ? '1 pokój' : `${lokal.pokoje} pokoje`
  const pietro = lokal.pietro === 0 ? 'parter' : `${lokal.pietro}. piętro`
  const cena   = lokal.cenaZaMetr ? Math.round(lokal.cenaZaMetr * lokal.powierzchnia) : null
  const cenaStr = cena ? ` Cena: ${cena.toLocaleString('pl-PL')} zł.` : ''

  const title = `Lokal ${lokal.nr} – ${lokal.powierzchnia} m², ${pokoje} | ${budynekNazwa}`
  const description = `Lokal ${lokal.nr} w ${budynekNazwa}, Słupsk – ${lokal.powierzchnia} m², ${pokoje}, ${pietro}.${cenaStr} Deweloper Matbet, Osiedle Nowe Miasto.`
  const url = `https://www.matbet.com.pl/lokal/${id}`
  const image = lokal.zdjecia?.[0] ?? lokal.rzutUrl

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'pl_PL',
      siteName: 'Matbet Deweloper',
      images: image ? [{ url: image, width: 1200, height: 630, alt: `Lokal ${lokal.nr} – ${budynekNazwa}` }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function LokalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lokal = await client.fetch(LOKAL_QUERY, { id })
  if (!lokal) notFound()

  return (
    <>
      <Navbar budynekNazwa={lokal.budynek?.nazwa ?? ''} />
      <KartaLokalu lokal={lokal} />
      <Footer />
    </>
  )
}
