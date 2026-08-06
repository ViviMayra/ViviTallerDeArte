import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getPiecesByCategory, getSections} from '@/lib/content'

export default async function PaintingPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, sections] = await Promise.all([
    getPiecesByCategory('pintura'),
    getSections('pintura'),
  ])

  return (
    <CategoryCatalog
      title={nav('pintura')}
      category="pintura"
      pieces={pieces}
      sections={sections}
    />
  )
}
