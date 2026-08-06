import type {MetadataRoute} from 'next'
import {demoExhibitions, demoPieces} from '@/lib/demo-data'
import {hasSanityConfig} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/client'
import {
  allExhibitionSlugsQuery,
  allPieceSlugsQuery,
} from '@/sanity/lib/queries'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const staticPaths = [
  '',
  '/joyeria',
  '/ceramica',
  '/ilustraciones',
  '/pintura',
  '/exhibiciones',
  '/about',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let pieces = demoPieces.map((p) => ({slug: p.slug}))
  let exhibitions = demoExhibitions.map((e) => ({slug: e.slug}))

  if (hasSanityConfig) {
    const [pieceData, exhibitionData] = await Promise.all([
      sanityFetch<{slug: string}[]>(allPieceSlugsQuery),
      sanityFetch<{slug: string}[]>(allExhibitionSlugsQuery),
    ])
    if (pieceData?.length) pieces = pieceData
    if (exhibitionData?.length) exhibitions = exhibitionData
  }

  const entries: MetadataRoute.Sitemap = []

  for (const locale of ['es', 'en']) {
    for (const path of staticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: {
          languages: {
            es: `${siteUrl}/es${path}`,
            en: `${siteUrl}/en${path}`,
          },
        },
      })
    }
    for (const piece of pieces) {
      const path = `/pieza/${piece.slug}`
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: {
          languages: {
            es: `${siteUrl}/es${path}`,
            en: `${siteUrl}/en${path}`,
          },
        },
      })
    }
    for (const exhibition of exhibitions) {
      const path = `/exhibiciones/${exhibition.slug}`
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        alternates: {
          languages: {
            es: `${siteUrl}/es${path}`,
            en: `${siteUrl}/en${path}`,
          },
        },
      })
    }
  }

  return entries
}
