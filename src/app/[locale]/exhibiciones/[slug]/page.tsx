import {notFound} from 'next/navigation'
import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server'
import type {Metadata} from 'next'
import {Link} from '@/i18n/navigation'
import {JsonLd} from '@/components/JsonLd'
import {ProductGallery} from '@/components/ProductGallery'
import {getExhibitionBySlug} from '@/lib/content'
import {t} from '@/lib/locale'
import {getImageUrl} from '@/lib/images'
import {buildPageMetadata} from '@/lib/seo'
import {getSiteUrl} from '@/lib/site-url'
import type {Locale} from '@/lib/types'

type Props = {params: Promise<{locale: string; slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale: localeParam, slug} = await params
  const exhibition = await getExhibitionBySlug(slug)
  if (!exhibition) return {}
  const locale = localeParam as Locale
  const image =
    getImageUrl(exhibition.seo?.image || exhibition.photos?.[0], 1200) ||
    undefined
  return buildPageMetadata({
    locale,
    path: `/exhibiciones/${slug}`,
    title: exhibition.seo?.title || t(exhibition.title, locale),
    description:
      exhibition.seo?.description ||
      t(exhibition.summary, locale) ||
      undefined,
    image,
  })
}

export default async function ExhibitionDetailPage({params}: Props) {
  const {locale: localeParam, slug} = await params
  setRequestLocale(localeParam)
  const locale = (await getLocale()) as Locale
  const exhibition = await getExhibitionBySlug(slug)
  if (!exhibition) notFound()
  const common = await getTranslations('common')
  const title = t(exhibition.title, locale)
  const siteUrl = getSiteUrl()
  const imageUrl = getImageUrl(exhibition.photos?.[0], 1200)

  const exhibitionLd = {
    '@context': 'https://schema.org',
    '@type': 'ExhibitionEvent',
    name: title,
    description: t(exhibition.summary, locale),
    image: imageUrl,
    url: `${siteUrl}/${locale}/exhibiciones/${slug}`,
    startDate: exhibition.year || undefined,
    location: t(exhibition.place, locale)
      ? {
          '@type': 'Place',
          name: t(exhibition.place, locale),
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'PE',
          },
        }
      : undefined,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <JsonLd data={exhibitionLd} />
      <Link href="/exhibiciones" className="text-xs text-muted hover:text-foreground">
        ← {common('back')}
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <ProductGallery
          photos={exhibition.photos || []}
          locale={locale}
          title={title}
        />
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.12em] text-muted">
            {[exhibition.year, t(exhibition.place, locale)]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {exhibition.summary && (
            <p className="mt-6 leading-relaxed text-muted">
              {t(exhibition.summary, locale)}
            </p>
          )}
          {exhibition.link && (
            <a
              href={exhibition.link}
              target="_blank"
              rel="noreferrer"
              className="catalog-link mt-8"
            >
              Link →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
