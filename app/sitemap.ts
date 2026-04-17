import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { MetadataRoute } from 'next'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)
const urlFor = (source: any) => builder.image(source)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lokale = await client.fetch(`*[_type == "lokal"]{
    _id, _updatedAt,
    zdjecia[] { asset->{ _id, url, metadata { dimensions } }, alt },
    rzut { asset->{ _id, url, metadata { dimensions } }, alt }
  }`)

  const lokaleEntries: MetadataRoute.Sitemap = lokale.map((lokal: any) => {
    const allPhotos = [
      ...(lokal.zdjecia || []),
      ...(lokal.rzut ? [lokal.rzut] : []),
    ].filter((f: any) => f?.asset?.url)

    return {
      url: `${SITE_URL}/lokal/${lokal._id}`,
      lastModified: lokal._updatedAt ? new Date(lokal._updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      // image sitemap extension
      images: allPhotos.map((foto: any) => urlFor(foto).width(1200).url()),
    }
  })

  return [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...lokaleEntries,
  ]
}
