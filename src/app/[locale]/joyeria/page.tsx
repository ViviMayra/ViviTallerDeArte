import {setRequestLocale} from 'next-intl/server'
import {JewelryCatalog} from '@/components/JewelryCatalog'
import {
  getJewelryCarousels,
  getJewelryTaxonomy,
  getPiecesByCategory,
} from '@/lib/content'

export default async function JoyeriaPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  const [pieces, taxonomy, carousels] = await Promise.all([
    getPiecesByCategory('joyeria'),
    getJewelryTaxonomy(),
    getJewelryCarousels(),
  ])

  return (
    <JewelryCatalog
      pieces={pieces}
      types={taxonomy.types}
      subtypes={taxonomy.subtypes}
      womenSlides={carousels.womenSlides || []}
      menSlides={carousels.menSlides || []}
    />
  )
}
