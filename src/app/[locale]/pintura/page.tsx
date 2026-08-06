import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getPiecesByCategory, getSubsections} from '@/lib/content'

export default async function PaintingPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, subsections] = await Promise.all([
    getPiecesByCategory('pintura'),
    getSubsections('pintura'),
  ])

  return (
    <CategoryCatalog
      title={nav('pintura')}
      category="pintura"
      pieces={pieces}
      subsections={subsections}
    />
  )
}
