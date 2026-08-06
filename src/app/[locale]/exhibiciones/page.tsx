import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import {getExhibitions} from '@/lib/content'
import {t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import type {Locale} from '@/lib/types'

export default async function ExhibitionsPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale: localeParam} = await params
  setRequestLocale(localeParam)
  const locale = (await getLocale()) as Locale
  const nav = await getTranslations('nav')
  const exhibitions = await getExhibitions()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.12em] md:text-4xl">
        {nav('exhibiciones')}
      </h1>
      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {exhibitions.map((item) => {
          const src = getImageUrl(item.photos?.[0], 900)
          return (
            <Link
              key={item._id}
              href={`/exhibiciones/${item.slug}`}
              className="piece-card group block"
            >
              <div className="aspect-[4/3] overflow-hidden bg-line">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={getImageAlt(item.photos?.[0], locale, t(item.title, locale))}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                ) : null}
              </div>
              <div className="mt-4">
                <h2 className="text-sm uppercase tracking-[0.1em]">
                  {t(item.title, locale)}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {[item.year, t(item.place, locale)].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
