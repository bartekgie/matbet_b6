import { client } from '@/lib/sanity'
import { BUDYNEK_QUERY, LOKALE_BUDYNKU_QUERY } from '@/lib/queries'
import { notFound } from 'next/navigation'
import Navbar              from '@/components/Navbar'
import HeroSection         from '@/components/HeroSection'
import WyszukiwarkaSection from '@/components/WyszukiwarkaSection'
import InwestycjaSection   from '@/components/InwestycjaSection'
import GaleriaSection      from '@/components/GaleriaSection'
import MapaSection         from '@/components/MapaSection'
import Footer              from '@/components/Footer'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const budynek = await client.fetch(BUDYNEK_QUERY, { slug })
  if (!budynek) return {}
  return {
    title: `${budynek.nazwa} — Osiedle Nowe Miasto Słupsk | Matbet`,
    description: `${budynek.nazwa} w ramach Osiedla Nowe Miasto w Słupsku. ${budynek.liczbaLokali} lokali na sprzedaż. Matbet Deweloper.`,
    openGraph: { images: [budynek.heroUrl] },
  }
}

export default async function BudynekPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const budynek = await client.fetch(BUDYNEK_QUERY, { slug })
  if (!budynek) notFound()

  const lokale = await client.fetch(LOKALE_BUDYNKU_QUERY, { budynekId: budynek._id })

  return (
    <>
      <Navbar budynekNazwa={budynek.nazwa} />
      <main>
        <HeroSection budynek={budynek} wolneLokali={lokale.filter((l: { status: string }) => l.status === 'wolne').length} />
        <WyszukiwarkaSection lokale={lokale} />
        <InwestycjaSection budynek={budynek} />
        <GaleriaSection galeria={budynek.galeria ?? []} />
        <MapaSection lat={budynek.lat} lng={budynek.lng} adres={budynek.adres} />
      </main>
      <Footer />
    </>
  )
}
