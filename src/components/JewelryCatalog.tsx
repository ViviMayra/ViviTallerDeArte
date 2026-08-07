import {getLocale, getTranslations} from 'next-intl/server'
import {JumpNav} from '@/components/JumpNav'
import {PieceCard} from '@/components/PieceCard'
import {ImageCarousel} from '@/components/ImageCarousel'
import {
  collectPieceTypes,
  genderTypeAnchor,
  pieceTypeSlug,
} from '@/lib/piece-types'
import {getImageUrl} from '@/lib/images'
import {t} from '@/lib/locale'
import type {Locale, Piece, SanityImage} from '@/lib/types'

function hasCarouselPhotos(slides: SanityImage[]) {
  return slides.some((slide) => Boolean(getImageUrl(slide, 900)))
}

type GenderId = 'mujer' | 'hombre' | 'general'

export async function JewelryCatalog({
  pieces,
  typeOrder = [],
  womenSlides,
  menSlides,
  generalSlides,
}: {
  pieces: Piece[]
  typeOrder?: string[]
  womenSlides: SanityImage[]
  menSlides: SanityImage[]
  generalSlides: SanityImage[]
}) {
  const locale = (await getLocale()) as Locale
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')

  const women = pieces.filter((p) => p.gender === 'mujer')
  const men = pieces.filter((p) => p.gender === 'hombre')
  const general = pieces.filter(
    (p) => p.gender === 'general' || !p.gender,
  )

  // Jump / main nav: Mujer + Hombre only (types live under those via hover)
  const jumpItems = [
    ...(women.length || hasCarouselPhotos(womenSlides)
      ? [{id: 'mujer', label: nav('women')}]
      : []),
    ...(men.length || hasCarouselPhotos(menSlides)
      ? [{id: 'hombre', label: nav('men')}]
      : []),
  ]

  function renderGenderBlock(
    id: GenderId,
    title: string,
    genderPieces: Piece[],
    slides: SanityImage[],
  ) {
    if (!genderPieces.length && !hasCarouselPhotos(slides)) return null

    const pieceTypes = collectPieceTypes(genderPieces, locale, typeOrder)
    const withTypes = pieceTypes
      .map((type) => ({
        type,
        items: genderPieces.filter((p) => pieceTypeSlug(p) === type.slug),
      }))
      .filter((entry) => entry.items.length > 0)

    const plain = genderPieces.filter((p) => !pieceTypeSlug(p))

    return (
      <section id={id} className="scroll-mt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.12em] md:text-3xl">
            {title}
          </h2>
          <div className="flex flex-wrap gap-4">
            {id !== 'mujer' && women.length > 0 && (
              <a href="#mujer" className="catalog-link">
                {common('seeWomen')} →
              </a>
            )}
            {id !== 'hombre' && men.length > 0 && (
              <a href="#hombre" className="catalog-link">
                {common('seeMen')} →
              </a>
            )}
          </div>
        </div>

        {plain.length > 0 && (
          <div className="mb-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {plain.map((piece) => (
              <PieceCard key={piece._id} piece={piece} />
            ))}
          </div>
        )}

        {withTypes.map(({type, items}) => (
          <div
            key={`${id}-${type.slug}`}
            id={genderTypeAnchor(id, type.slug)}
            className="mb-14 scroll-mt-28"
          >
            <h3 className="mb-6 text-sm uppercase tracking-[0.16em] text-muted">
              {t(type.label, locale)}
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {items.map((piece) => (
                <PieceCard key={piece._id} piece={piece} />
              ))}
            </div>
          </div>
        ))}

        <ImageCarousel slides={slides} locale={locale} />
      </section>
    )
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.12em] md:text-4xl">
          {nav('joyeria')}
        </h1>
      </div>
      <JumpNav items={jumpItems} label={common('jumpTo')} />
      <div className="mx-auto max-w-7xl space-y-24 px-4 py-10 md:px-8">
        {renderGenderBlock('mujer', nav('women'), women, womenSlides)}
        {renderGenderBlock('hombre', nav('men'), men, menSlides)}
        {renderGenderBlock('general', nav('general'), general, generalSlides)}
      </div>
    </div>
  )
}
