import { client } from '@/lib/client'
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

  const osiedleNazwa = budynek.osiedle?.nazwa ?? 'Matbet'
  const miasto       = budynek.osiedle?.miasto ?? ''
  const miejsce      = [osiedleNazwa, miasto].filter(Boolean).join(' ')

  const title = `${budynek.nazwa} – ${miejsce}`
  const description = `${budynek.nazwa} to nowoczesna inwestycja dewelopera Matbet${miasto ? ` w ${miasto}` : ''}. ${budynek.liczbaLokali ? `${budynek.liczbaLokali} lokali` : 'Lokale'} na sprzedaż${osiedleNazwa ? ` w ${osiedleNazwa}` : ''}. ${budynek.adres ?? ''}`.trim()
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nowemiasto.matbet.com.pl'}/budynek/${slug}`

  return {
    title,
    description,
    keywords: [`${budynek.nazwa}${miasto ? ` ${miasto}` : ''}`, miasto ? `mieszkania ${miasto}` : 'mieszkania', `deweloper ${miasto}`.trim(), 'Matbet deweloper', miejsce].filter(Boolean),
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
  const osiedleNazwa  = budynek.osiedle?.nazwa
  const osiedleMiasto = budynek.osiedle?.miasto

  return (
    <>
      <Navbar budynekNazwa={budynek.nazwa} osiedleNazwa={osiedleNazwa} />
      <main>
        <HeroSection budynek={budynek} wolneLokali={lokale.filter((l: { status: string }) => l.status === 'wolne').length} />
        <WyszukiwarkaSection lokale={lokale} budynekNazwa={budynek.nazwa} osiedleNazwa={osiedleNazwa} osiedleMiasto={osiedleMiasto} />
        <InwestycjaSection budynek={budynek} />
        <GaleriaSection galeria={budynek.galeria ?? []} osiedleNazwa={osiedleNazwa} />
        <MapaSection
          adres={budynek.osiedle?.adres}
          googleMapsUrl={budynek.osiedle?.googleMapsUrl}
          streetViewEmbedUrl={budynek.osiedle?.streetViewEmbedUrl}
          miejsca={budynek.osiedle?.miejscaWOkolicy}
        />
        <FormularzSection budynekNazwa={budynek.nazwa} />
      </main>
      <Footer />
    </>
  )
}
