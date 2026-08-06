import {getLocale, getTranslations} from 'next-intl/server'
import {JumpNav} from '@/components/JumpNav'
import {PieceCard} from '@/components/PieceCard'
import {t} from '@/lib/locale'
import type {Category, Locale, Piece, SectionRef} from '@/lib/types'

export async function CategoryCatalog({
  title,
  pieces,
  sections,
}: {
  title: string
  category: Category
  pieces: Piece[]
  sections: SectionRef[]
}) {
  const locale = (await getLocale()) as Locale
  const common = await getTranslations('common')

  const jumpItems = sections.map((s) => ({
    id: s.slug,
    label: t(s.title, locale),
  }))

  const unsectioned = pieces.filter((p) => !p.section)

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
        {sections.length === 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {pieces.map((piece) => (
              <PieceCard key={piece._id} piece={piece} />
            ))}
          </div>
        ) : (
          <>
            {unsectioned.length > 0 && (
              <section>
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                  {unsectioned.map((piece) => (
                    <PieceCard key={piece._id} piece={piece} />
                  ))}
                </div>
              </section>
            )}
            {sections.map((section) => {
              const subset = pieces.filter(
                (p) => p.section?._id === section._id,
              )
              if (!subset.length) return null
              return (
                <section key={section._id} id={section.slug}>
                  <h2 className="mb-8 font-[family-name:var(--font-display)] text-xl uppercase tracking-[0.1em]">
                    {t(section.title, locale)}
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
      </div>
    </div>
  )
}
