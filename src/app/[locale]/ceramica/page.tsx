import {getTranslations, setRequestLocale} from 'next-intl/server'
import {CategoryCatalog} from '@/components/CategoryCatalog'
import {getPiecesByCategory, getSubsections} from '@/lib/content'

export default async function CeramicsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const nav = await getTranslations('nav')
  const [pieces, subsections] = await Promise.all([
    getPiecesByCategory('ceramica'),
    getSubsections('ceramica'),
  ])

  return (
    <CategoryCatalog
      title={nav('ceramica')}
      category="ceramica"
      pieces={pieces}
      subsections={subsections}
    />
  )
}
