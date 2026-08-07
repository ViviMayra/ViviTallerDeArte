import type {MetadataRoute} from 'next'
import {demoExhibitions, demoPieces} from '@/lib/demo-data'
import {getSiteUrl} from '@/lib/site-url'
import {hasSanityConfig} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/client'
import {
  allExhibitionSlugsQuery,
  allPieceSlugsQuery,
} from '@/sanity/lib/queries'

const siteUrl = getSiteUrl()

const staticPaths: {path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']}[] = [
  {path: '', priority: 1, changeFrequency: 'weekly'},
  {path: '/joyeria', priority: 0.9, changeFrequency: 'weekly'},
  {path: '/ceramica', priority: 0.8, changeFrequency: 'weekly'},
  {path: '/ilustraciones', priority: 0.8, changeFrequency: 'weekly'},
  {path: '/pintura', priority: 0.8, changeFrequency: 'weekly'},
  {path: '/exhibiciones', priority: 0.7, changeFrequency: 'monthly'},
  {path: '/about', priority: 0.6, changeFrequency: 'monthly'},
]

function languageAlternates(path: string) {
  return {
    es: `${siteUrl}/es${path}`,
    en: `${siteUrl}/en${path}`,
    'x-default': `${siteUrl}/es${path}`,
  }
}

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

  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of ['es', 'en']) {
    for (const item of staticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${item.path}`,
        lastModified: now,
        changeFrequency: item.changeFrequency,
        priority: item.priority,
        alternates: {
          languages: languageAlternates(item.path),
        },
      })
    }
    for (const piece of pieces) {
      const path = `/pieza/${piece.slug}`
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: languageAlternates(path),
        },
      })
    }
    for (const exhibition of exhibitions) {
      const path = `/exhibiciones/${exhibition.slug}`
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: {
          languages: languageAlternates(path),
        },
      })
    }
  }

  return entries
}
