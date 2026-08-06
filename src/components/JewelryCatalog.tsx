import {getLocale, getTranslations} from 'next-intl/server'
import {JumpNav} from '@/components/JumpNav'
import {PieceCard} from '@/components/PieceCard'
import {ImageCarousel} from '@/components/ImageCarousel'
import {t} from '@/lib/locale'
import type {Locale, Piece, SanityImage, TaxonomyRef} from '@/lib/types'

export async function JewelryCatalog({
  pieces,
  types,
  subtypes,
  womenSlides,
  menSlides,
}: {
  pieces: Piece[]
  types: TaxonomyRef[]
  subtypes: TaxonomyRef[]
  womenSlides: SanityImage[]
  menSlides: SanityImage[]
}) {
  const locale = (await getLocale()) as Locale
  const nav = await getTranslations('nav')
  const common = await getTranslations('common')

  const women = pieces.filter((p) => p.gender === 'mujer' || !p.gender)
  const men = pieces.filter((p) => p.gender === 'hombre')

  const jumpItems = [
    {id: 'mujer', label: nav('women')},
    {id: 'hombre', label: nav('men')},
    ...types.map((type) => ({
      id: type.slug,
      label: t(type.title, locale),
    })),
  ]

  function renderGenderBlock(
    id: 'mujer' | 'hombre',
    title: string,
    genderPieces: Piece[],
    slides: SanityImage[],
  ) {
    const typed = types
      .map((type) => {
        const typePieces = genderPieces.filter(
          (p) => p.jewelryType?._id === type._id,
        )
        const typeSubtypes = subtypes.filter((s) => s.parentId === type._id)
        return {type, typePieces, typeSubtypes}
      })
      .filter((entry) => entry.typePieces.length > 0)

    const untyped = genderPieces.filter((p) => !p.jewelryType)

    return (
      <section id={id} className="scroll-mt-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.12em] md:text-3xl">
            {title}
          </h2>
          {id === 'mujer' && men.length > 0 && (
            <a href="#hombre" className="catalog-link">
              {common('seeMen')} →
            </a>
          )}
          {id === 'hombre' && women.length > 0 && (
            <a href="#mujer" className="catalog-link">
              {common('seeWomen')} →
            </a>
          )}
        </div>

        {untyped.length > 0 && (
          <div className="mb-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {untyped.map((piece) => (
              <PieceCard key={piece._id} piece={piece} />
            ))}
          </div>
        )}

        {typed.map(({type, typePieces, typeSubtypes}) => (
          <div key={type._id} id={type.slug} className="mb-14 scroll-mt-28">
            <h3 className="mb-6 text-sm uppercase tracking-[0.16em] text-muted">
              {t(type.title, locale)}
            </h3>

            {typeSubtypes.length === 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {typePieces.map((piece) => (
                  <PieceCard key={piece._id} piece={piece} />
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {typePieces.filter((p) => !p.jewelrySubtype).length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                    {typePieces
                      .filter((p) => !p.jewelrySubtype)
                      .map((piece) => (
                        <PieceCard key={piece._id} piece={piece} />
                      ))}
                  </div>
                )}
                {typeSubtypes.map((sub) => {
                  const subset = typePieces.filter(
                    (p) => p.jewelrySubtype?._id === sub._id,
                  )
                  if (!subset.length) return null
                  return (
                    <div key={sub._id} id={sub.slug} className="scroll-mt-28">
                      <h4 className="mb-4 text-xs uppercase tracking-[0.14em]">
                        {t(sub.title, locale)}
                      </h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                        {subset.map((piece) => (
                          <PieceCard key={piece._id} piece={piece} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
      </div>
    </div>
  )
}
