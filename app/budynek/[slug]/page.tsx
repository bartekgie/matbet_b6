import { client } from '@/lib/sanity'
import { BUDYNEK_QUERY, LOKALE_BUDYNKU_QUERY } from '@/lib/queries'
import { notFound } from 'next/navigation'
import Navbar              from '@/components/Navbar'
import HeroSection         from '@/components/HeroSection'
import WyszukiwarkaSection from '@/components/WyszukiwarkaSection'
import InwestycjaSection   from '@/components/InwestycjaSection'
import GaleriaSection      from '@/components/GaleriaSection'
import MapaSection         from '@/components/MapaSection'
import FormularzSection    from '@/components/FormularzSection'
import Footer              from '@/components/Footer'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const budynek = await client.fetch(BUDYNEK_QUERY, { slug })
  if (!budynek) return {}

  const title = `${budynek.nazwa} – Osiedle Nowe Miasto Słupsk`
  const description = `${budynek.nazwa} to nowoczesna inwestycja dewelopera Matbet w Słupsku. ${budynek.liczbaLokali ? `${budynek.liczbaLokali} lokali` : 'Lokale'} na sprzedaż w Osiedlu Nowe Miasto. ${budynek.adres ?? ''}`.trim()
  const url = `https://www.matbet.com.pl/budynek/${slug}`

  return {
    title,
    description,
    keywords: [`${budynek.nazwa} Słupsk`, 'mieszkania Słupsk', 'Osiedle Nowe Miasto Słupsk', 'Matbet deweloper', 'nowe mieszkania Słupsk'],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'pl_PL',
      siteName: 'Matbet Deweloper',
      images: budynek.heroUrl ? [{ url: budynek.heroUrl, width: 1200, height: 630, alt: budynek.nazwa }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: budynek.heroUrl ? [budynek.heroUrl] : [],
    },
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
        <FormularzSection />
      </main>
      <Footer />
    </>
  )
}
