import type {Metadata} from 'next'
import {setRequestLocale} from 'next-intl/server'
import {JewelryCatalog} from '@/components/JewelryCatalog'
import {
  getCategoryTypeOrder,
  getJewelryCarousels,
  getPiecesByCategory,
} from '@/lib/content'
import {buildPageMetadata, categorySeoCopy} from '@/lib/seo'
import type {Locale} from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const copy = categorySeoCopy('joyeria', locale as Locale)
  return buildPageMetadata({
    locale,
    path: '/joyeria',
    title: copy.title,
    description: copy.description,
  })
}

export default async function JoyeriaPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)

  const [pieces, typeOrder, carousels] = await Promise.all([
    getPiecesByCategory('joyeria'),
    getCategoryTypeOrder('joyeria'),
    getJewelryCarousels(),
  ])

  return (
    <JewelryCatalog
      pieces={pieces}
      typeOrder={typeOrder}
      womenSlides={carousels.womenSlides || []}
      menSlides={carousels.menSlides || []}
      generalSlides={carousels.generalSlides || []}
    />
  )
}
