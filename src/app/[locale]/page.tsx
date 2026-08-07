import type {Metadata} from 'next'
import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import {FeaturedCarousel} from '@/components/FeaturedCarousel'
import {HeroStyledText} from '@/components/HeroStyledText'
import {getHomePage} from '@/lib/content'
import {t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import {getStyledBlocks} from '@/lib/styled-text'
import type {Locale} from '@/lib/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params
  const home = await getHomePage()
  return {
    title:
      home.seo?.title ||
      (locale === 'es'
        ? 'VIVI Taller de Arte | Joyería y arte en Perú'
        : 'VIVI Taller de Arte | Jewelry & art in Peru'),
    description:
      home.seo?.description ||
      (locale === 'es'
        ? 'Joyería artesanal, cerámica, ilustración y pintura. Piezas únicas hechas en Perú.'
        : 'Handmade jewelry, ceramics, illustration, and painting. Unique pieces made in Peru.'),
    alternates: {
      languages: {
        es: '/es',
        en: '/en',
      },
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale: localeParam} = await params
  setRequestLocale(localeParam)
  const locale = (await getLocale()) as Locale
  const home = await getHomePage()
  const nav = await getTranslations('nav')
  const homeT = await getTranslations('home')
  const heroSrc = getImageUrl(home.heroImage, 2000) || '/demo/hero.svg'

  return (
    <div>
      <section className="relative -mt-32 min-h-[78vh] w-full overflow-hidden md:-mt-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt={getImageAlt(home.heroImage, locale, 'VIVI')}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-4 pb-16 md:px-8">
          <div className="text-left">
            <p className="animate-fade-up font-[family-name:var(--font-display)] text-5xl tracking-[0.2em] md:text-7xl">
              {homeT('brand')}
            </p>
            <HeroStyledText
              className="animate-fade-up-delay mt-3"
              variant="primary"
              value={getStyledBlocks(
                home.heroEyebrow,
                locale,
                homeT('tagline'),
              )}
            />
            <HeroStyledText
              className="animate-fade-up-delay mt-2 max-w-md"
              variant="secondary"
              value={getStyledBlocks(home.heroSubline, locale)}
            />
          </div>
        </div>
      </section>

      <FeaturedCarousel
        slides={home.featuredCarousel || []}
        title={t(home.featuredCarouselTitle, locale)}
        locale={locale}
      />

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="space-y-24 md:space-y-32">
          {(home.sections || []).map((section, index) => {
            const imageLeft = index % 2 === 0
            const src = getImageUrl(section.image, 1200)
            return (
              <div
                key={`${section.link}-${index}`}
                className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${
                  imageLeft ? '' : 'md:[&>*:first-child]:order-2'
                }`}
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-[#f3efe6] to-[#d9c39a] p-2.5 md:p-3">
                  {src ? (
                    <div className="h-full w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={getImageAlt(
                          section.image,
                          locale,
                          t(section.title, locale),
                        )}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center font-[family-name:var(--font-display)] text-3xl text-foreground/40">
                      {t(section.title, locale)}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.08em] md:text-4xl">
                    {t(section.title, locale)}
                  </h2>
                  {section.text && (
                    <p className="mt-5 max-w-md text-muted leading-relaxed">
                      {t(section.text, locale)}
                    </p>
                  )}
                  <Link href={`/${section.link}`} className="catalog-link mt-8">
                    {nav('viewCatalog')} →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
