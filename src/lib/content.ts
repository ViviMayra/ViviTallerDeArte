import {
  demoAbout,
  demoCarousels,
  demoExhibitions,
  demoHome,
  demoPieces,
  demoSections,
  demoSettings,
} from './demo-data'
import type {
  AboutPage,
  Category,
  Exhibition,
  HomePage,
  Piece,
  SectionRef,
  Settings,
} from './types'
import {hasSanityConfig} from '@/sanity/env'
import {sanityFetch} from '@/sanity/lib/client'
import type {SanityImage} from './types'
import {
  aboutPageQuery,
  categoryCarouselQuery,
  exhibitionBySlugQuery,
  exhibitionsQuery,
  homePageQuery,
  jewelryCarouselsQuery,
  pieceBySlugQuery,
  piecesByCategoryQuery,
  relatedPiecesQuery,
  sectionsByCategoryQuery,
  settingsQuery,
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

export async function getSections(category: Category): Promise<SectionRef[]> {
  if (!hasSanityConfig) {
    return demoSections.filter((s) => s.category === category)
  }
  const data = await sanityFetch<SectionRef[]>(sectionsByCategoryQuery, {
    category,
  })
  return data?.length
    ? data
    : demoSections.filter((s) => s.category === category)
}

export async function getJewelryCarousels() {
  if (!hasSanityConfig) return demoCarousels
  const data = await sanityFetch<typeof demoCarousels>(jewelryCarouselsQuery)
  return data || demoCarousels
}

export async function getCategoryCarousel(
  category: Exclude<Category, 'joyeria'>,
): Promise<SanityImage[]> {
  if (!hasSanityConfig) return []
  const id = `carousel-${category}`
  const data = await sanityFetch<{slides?: SanityImage[]}>(
    categoryCarouselQuery,
    {id, draftId: `drafts.${id}`},
  )
  return data?.slides || []
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
