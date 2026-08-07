import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {
  getCategoryCarousel,
  getCategoryTypeOrder,
  getPiecesByCategory,
} from '@/lib/content'

export default async function IllustrationsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, typeOrder, carouselSlides] = await Promise.all([
    getPiecesByCategory('ilustraciones'),
    getCategoryTypeOrder('ilustraciones'),
    getCategoryCarousel('ilustraciones'),
  ])

  return (
    <CategoryCatalog
      title={nav('ilustraciones')}
      category="ilustraciones"
      pieces={pieces}
      typeOrder={typeOrder}
      carouselSlides={carouselSlides}
    />
  )
}
