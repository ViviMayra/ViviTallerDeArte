import {setRequestLocale} from 'next-intl/server'
import {JewelryCatalog} from '@/components/JewelryCatalog'
import {getJewelryCarousels, getPiecesByCategory} from '@/lib/content'

export default async function JoyeriaPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  const [pieces, carousels] = await Promise.all([
    getPiecesByCategory('joyeria'),
    getJewelryCarousels(),
  ])

  return (
    <JewelryCatalog
      pieces={pieces}
      womenSlides={carousels.womenSlides || []}
      menSlides={carousels.menSlides || []}
      generalSlides={carousels.generalSlides || []}
    />
  )
}
