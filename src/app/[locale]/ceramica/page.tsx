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
  const copy = categorySeoCopy('ceramica', locale as Locale)
  return buildPageMetadata({
    locale,
    path: '/ceramica',
    title: copy.title,
    description: copy.description,
  })
}

export default async function CeramicsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, typeOrder, carouselSlides] = await Promise.all([
    getPiecesByCategory('ceramica'),
    getCategoryTypeOrder('ceramica'),
    getCategoryCarousel('ceramica'),
  ])

  return (
    <CategoryCatalog
      title={nav('ceramica')}
      category="ceramica"
      pieces={pieces}
      typeOrder={typeOrder}
      carouselSlides={carouselSlides}
    />
  )
}
