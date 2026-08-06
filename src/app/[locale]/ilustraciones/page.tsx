import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getPiecesByCategory, getSubsections} from '@/lib/content'

export default async function IllustrationsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, subsections] = await Promise.all([
    getPiecesByCategory('ilustraciones'),
    getSubsections('ilustraciones'),
  ])

  return (
    <CategoryCatalog
      title={nav('ilustraciones')}
      category="ilustraciones"
      pieces={pieces}
      subsections={subsections}
    />
  )
}
