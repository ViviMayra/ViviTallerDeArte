import type {Metadata} from 'next'
import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import {FeaturedCarousel} from '@/components/FeaturedCarousel'
import {HeroStyledText} from '@/components/HeroStyledText'
import {getHomePage} from '@/lib/content'
import {t} from '@/lib/locale'
import {getImageAlt, getImageObjectPosition, getImageUrl} from '@/lib/images'
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
  const heroObjectPosition = getImageObjectPosition(home.heroImage)

  return (
    <div>
      {/*
        Mobile/tablet: show the full cover photo (no CSS crop) so both eyes
        stay visible; titles sit under the photo.
        Large desktop: unchanged full-bleed overlay hero.
      */}
      <section className="relative -mt-32 w-full overflow-hidden md:-mt-40 lg:min-h-[78vh]">
        <div className="h-32 shrink-0 md:h-40 lg:hidden" aria-hidden="true" />

        <div className="relative w-full bg-background lg:absolute lg:inset-0 lg:h-full lg:min-h-[78vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            alt={getImageAlt(home.heroImage, locale, 'VIVI')}
            className="block h-auto w-full object-contain lg:absolute lg:inset-0 lg:h-full lg:object-cover"
            style={
              heroObjectPosition
                ? {objectPosition: heroObjectPosition}
                : undefined
            }
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-background/35 via-transparent to-transparent lg:block" />
          <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-background/80 via-background/20 to-transparent lg:block" />
        </div>

        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pb-10 pt-6 lg:absolute lg:inset-0 lg:min-h-[78vh] lg:px-8 lg:pb-16 lg:pt-0">
          <div className="hero-titles flex w-full max-w-xl flex-col items-start text-left">
            <p className="animate-fade-up w-full self-start -ml-1 font-[family-name:var(--font-display)] text-5xl tracking-[0.2em] md:-ml-1.5 md:text-7xl">
              {homeT('brand')}
            </p>
            <HeroStyledText
              className="animate-fade-up-delay mt-3 w-full self-start"
              variant="primary"
              value={getStyledBlocks(
                home.heroEyebrow,
                locale,
                homeT('tagline'),
              )}
            />
            <HeroStyledText
              className="animate-fade-up-delay mt-2 w-full self-start"
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
