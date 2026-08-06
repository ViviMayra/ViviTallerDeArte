import {setRequestLocale} from 'next-intl/server'
import {JewelryCatalog} from '@/components/JewelryCatalog'
import {
  getJewelryCarousels,
  getPiecesByCategory,
  getSections,
} from '@/lib/content'

export default async function JoyeriaPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  const [pieces, sections, carousels] = await Promise.all([
    getPiecesByCategory('joyeria'),
    getSections('joyeria'),
    getJewelryCarousels(),
  ])

  return (
    <JewelryCatalog
      pieces={pieces}
      sections={sections}
      womenSlides={carousels.womenSlides || []}
      menSlides={carousels.menSlides || []}
      generalSlides={carousels.generalSlides || []}
    />
  )
}
