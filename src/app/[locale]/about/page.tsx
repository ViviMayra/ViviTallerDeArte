import {getLocale, setRequestLocale} from 'next-intl/server'
import {PortableBody} from '@/components/PortableBody'
import {getAboutPage} from '@/lib/content'
import {getImageAlt, getImageUrl} from '@/lib/images'
import {t} from '@/lib/locale'
import type {AboutSection, Locale, SanityImage} from '@/lib/types'

function sectionAlignClass(align?: AboutSection['align']) {
  if (align === 'right') return 'flex justify-end'
  if (align === 'center') return 'flex justify-center'
  return undefined
}

function isSideBySide(section: AboutSection) {
  return (
    section.align === 'sideLeft' ||
    section.align === 'sideRight' ||
    section.layout === 'sideBySide'
  )
}

function isPhotoRight(section: AboutSection) {
  if (section.align === 'sideRight') return true
  if (section.align === 'sideLeft') return false
  return section.imageSide === 'right'
}

function imageWidthPercent(value: SanityImage): number {
  const raw = value.widthPercent
  if (typeof raw !== 'number' || Number.isNaN(raw)) return 100
  return Math.min(100, Math.max(10, Math.round(raw)))
}

function AboutSideImage({
  image,
  locale,
}: {
  image: SanityImage
  locale: Locale
}) {
  const src = getImageUrl(image, 1400)
  if (!src) return null
  const widthPercent = imageWidthPercent(image)
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={getImageAlt(image, locale)}
        className="max-w-full object-cover"
        style={{width: `${widthPercent}%`}}
      />
    </div>
  )
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale: localeParam} = await params
  setRequestLocale(localeParam)
  const locale = (await getLocale()) as Locale
  const about = await getAboutPage()
  const sections = about.sections || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl uppercase tracking-[0.12em] md:text-4xl">
        {t(about.title, locale, locale === 'es' ? 'Nosotros' : 'About')}
      </h1>
      <div className="mt-10 space-y-16 md:space-y-20">
        {sections.map((section, index) => {
          const body = section.body?.[locale] || section.body?.es || []
          const key = section._key || `about-section-${index}`
          const sideBySide = isSideBySide(section) && Boolean(section.image)

          if (sideBySide && section.image) {
            if (!body.length && !getImageUrl(section.image, 100)) return null
            const photoRight = isPhotoRight(section)
            return (
              <div
                key={key}
                className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
              >
                <div className={photoRight ? 'md:order-2' : undefined}>
                  <AboutSideImage image={section.image} locale={locale} />
                </div>
                <div className={photoRight ? 'md:order-1' : undefined}>
                  <PortableBody
                    value={body as unknown[]}
                    locale={locale}
                    className="w-full max-w-none"
                  />
                </div>
              </div>
            )
          }

          if (!body.length) return null
          return (
            <div key={key} className={sectionAlignClass(section.align)}>
              <PortableBody value={body as unknown[]} locale={locale} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
