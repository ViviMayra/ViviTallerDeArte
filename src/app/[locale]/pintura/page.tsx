import type {Metadata} from 'next'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {
  getCategoryCarousel,
  getCategoryTypeOrder,
  getPiecesByCategory,
} from '@/lib/content'
import {buildPageMetadata, categorySeoCopy} from '@/lib/seo'
import type {Locale} from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const copy = categorySeoCopy('pintura', locale as Locale)
  return buildPageMetadata({
    locale,
    path: '/pintura',
    title: copy.title,
    description: copy.description,
  })
}

export default async function PaintingPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, typeOrder, carouselSlides] = await Promise.all([
    getPiecesByCategory('pintura'),
    getCategoryTypeOrder('pintura'),
    getCategoryCarousel('pintura'),
  ])

  return (
    <CategoryCatalog
      title={nav('pintura')}
      category="pintura"
      pieces={pieces}
      typeOrder={typeOrder}
      carouselSlides={carouselSlides}
    />
  )
}
