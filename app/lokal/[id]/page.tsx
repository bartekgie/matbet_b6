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
  return {
    title: `Apt. ${lokal.nr} — ${lokal.budynek?.nazwa ?? 'Matbet'} | Matbet Deweloper`,
    description: `Lokal ${lokal.nr}, ${lokal.powierzchnia} m², ${lokal.pokoje} ${lokal.pokoje === 1 ? 'pokój' : 'pokoje'}. Status: ${lokal.status}.`,
    openGraph: lokal.zdjecia?.[0] ? { images: [lokal.zdjecia[0]] } : undefined,
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
