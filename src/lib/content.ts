import {
  demoAbout,
  demoCarousels,
  demoExhibitions,
  demoHome,
  demoJewelrySubtypes,
  demoJewelryTypes,
  demoPieces,
  demoSettings,
} from './demo-data'
import type {
  AboutPage,
  Category,
  Exhibition,
  HomePage,
  Piece,
  Settings,
  TaxonomyRef,
} from './types'
import {hasSanityConfig} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/client'
import {
  aboutPageQuery,
  exhibitionBySlugQuery,
  exhibitionsQuery,
  homePageQuery,
  jewelryCarouselsQuery,
  jewelrySubtypesQuery,
  jewelryTypesQuery,
  pieceBySlugQuery,
  piecesByCategoryQuery,
  relatedPiecesQuery,
  settingsQuery,
  subsectionsByCategoryQuery,
} from '@/sanity/lib/queries'

export async function getSettings(): Promise<Settings> {
  if (!hasSanityConfig) return demoSettings
  const data = await sanityFetch<Settings>(settingsQuery)
  return {...demoSettings, ...data}
}

export async function getHomePage(): Promise<HomePage> {
  if (!hasSanityConfig) return demoHome
  const data = await sanityFetch<HomePage>(homePageQuery)
  return data?.sections?.length ? data : demoHome
}

export async function getAboutPage(): Promise<AboutPage> {
  if (!hasSanityConfig) return demoAbout
  const data = await sanityFetch<AboutPage>(aboutPageQuery)
  return data || demoAbout
}

export async function getPiecesByCategory(category: Category): Promise<Piece[]> {
  if (!hasSanityConfig) {
    return demoPieces.filter((p) => p.category === category)
  }
  const data = await sanityFetch<Piece[]>(piecesByCategoryQuery, {category})
  return data?.length ? data : demoPieces.filter((p) => p.category === category)
}

export async function getPieceBySlug(slug: string): Promise<Piece | null> {
  if (!hasSanityConfig) {
    return demoPieces.find((p) => p.slug === slug) || null
  }
  const data = await sanityFetch<Piece>(pieceBySlugQuery, {slug})
  return data || demoPieces.find((p) => p.slug === slug) || null
}

export async function getRelatedPieces(
  category: Category,
  slug: string,
): Promise<Piece[]> {
  if (!hasSanityConfig) {
    return demoPieces
      .filter((p) => p.category === category && p.slug !== slug)
      .slice(0, 4)
  }
  const data = await sanityFetch<Piece[]>(relatedPiecesQuery, {category, slug})
  return data || []
}

export async function getJewelryTaxonomy(): Promise<{
  types: TaxonomyRef[]
  subtypes: TaxonomyRef[]
}> {
  if (!hasSanityConfig) {
    return {types: demoJewelryTypes, subtypes: demoJewelrySubtypes}
  }
  const [types, subtypes] = await Promise.all([
    sanityFetch<TaxonomyRef[]>(jewelryTypesQuery),
    sanityFetch<TaxonomyRef[]>(jewelrySubtypesQuery),
  ])
  return {
    types: types?.length ? types : demoJewelryTypes,
    subtypes: subtypes?.length ? subtypes : demoJewelrySubtypes,
  }
}

export async function getSubsections(category: Category): Promise<TaxonomyRef[]> {
  if (category === 'joyeria') return []
  if (!hasSanityConfig) return []
  const data = await sanityFetch<TaxonomyRef[]>(subsectionsByCategoryQuery, {
    category,
  })
  return data || []
}

export async function getJewelryCarousels() {
  if (!hasSanityConfig) return demoCarousels
  const data = await sanityFetch<typeof demoCarousels>(jewelryCarouselsQuery)
  return data || demoCarousels
}

export async function getExhibitions(): Promise<Exhibition[]> {
  if (!hasSanityConfig) return demoExhibitions
  const data = await sanityFetch<Exhibition[]>(exhibitionsQuery)
  return data?.length ? data : demoExhibitions
}

export async function getExhibitionBySlug(
  slug: string,
): Promise<Exhibition | null> {
  if (!hasSanityConfig) {
    return demoExhibitions.find((e) => e.slug === slug) || null
  }
  const data = await sanityFetch<Exhibition>(exhibitionBySlugQuery, {slug})
  return data || demoExhibitions.find((e) => e.slug === slug) || null
}
