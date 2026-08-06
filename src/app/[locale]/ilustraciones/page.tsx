import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getPiecesByCategory, getSections} from '@/lib/content'

export default async function IllustrationsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, sections] = await Promise.all([
    getPiecesByCategory('ilustraciones'),
    getSections('ilustraciones'),
  ])

  return (
    <CategoryCatalog
      title={nav('ilustraciones')}
      category="ilustraciones"
      pieces={pieces}
      sections={sections}
    />
  )
}
