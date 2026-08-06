import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getCategoryCarousel, getPiecesByCategory} from '@/lib/content'

export default async function CeramicsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, carouselSlides] = await Promise.all([
    getPiecesByCategory('ceramica'),
    getCategoryCarousel('ceramica'),
  ])

  return (
    <CategoryCatalog
      title={nav('ceramica')}
      category="ceramica"
      pieces={pieces}
      carouselSlides={carouselSlides}
    />
  )
}
