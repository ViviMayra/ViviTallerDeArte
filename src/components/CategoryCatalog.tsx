import {getLocale, getTranslations} from 'next-intl/server'
import {JumpNav} from '@/components/JumpNav'
import {PieceCard} from '@/components/PieceCard'
import {ImageCarousel} from '@/components/ImageCarousel'
import {collectPieceTypes, pieceTypeSlug} from '@/lib/piece-types'
import {t} from '@/lib/locale'
import type {Category, Locale, Piece, SanityImage} from '@/lib/types'

export async function CategoryCatalog({
  title,
  pieces,
  carouselSlides = [],
}: {
  title: string
  category: Category
  pieces: Piece[]
  carouselSlides?: SanityImage[]
}) {
  const locale = (await getLocale()) as Locale
  const common = await getTranslations('common')
  const pieceTypes = collectPieceTypes(pieces, locale)

  const jumpItems = pieceTypes.map((type) => ({
    id: type.slug,
    label: t(type.label, locale),
  }))

  const plain = pieces.filter((p) => !pieceTypeSlug(p))

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.12em] md:text-4xl">
          {title}
        </h1>
      </div>

      {jumpItems.length > 0 && (
        <JumpNav items={jumpItems} label={common('jumpTo')} />
      )}

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 md:px-8">
        {pieceTypes.length === 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {pieces.map((piece) => (
              <PieceCard key={piece._id} piece={piece} />
            ))}
          </div>
        ) : (
          <>
            {plain.length > 0 && (
              <section>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                  {plain.map((piece) => (
                    <PieceCard key={piece._id} piece={piece} />
                  ))}
                </div>
              </section>
            )}
            {pieceTypes.map((type) => {
              const subset = pieces.filter(
                (p) => pieceTypeSlug(p) === type.slug,
              )
              if (!subset.length) return null
              return (
                <section key={type.slug} id={type.slug}>
                  <h2 className="mb-8 font-[family-name:var(--font-display)] text-xl uppercase tracking-[0.1em]">
                    {t(type.label, locale)}
                  </h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                    {subset.map((piece) => (
                      <PieceCard key={piece._id} piece={piece} />
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        <ImageCarousel slides={carouselSlides} locale={locale} />
      </div>
    </div>
  )
}
