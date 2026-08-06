import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getCategoryCarousel, getPiecesByCategory} from '@/lib/content'

export default async function PaintingPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, carouselSlides] = await Promise.all([
    getPiecesByCategory('pintura'),
    getCategoryCarousel('pintura'),
  ])

  return (
    <CategoryCatalog
      title={nav('pintura')}
      category="pintura"
      pieces={pieces}
      carouselSlides={carouselSlides}
    />
  )
}
