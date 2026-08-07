import {getLocale, setRequestLocale} from 'next-intl/server'
import {PortableBody} from '@/components/PortableBody'
import {getAboutPage} from '@/lib/content'
import {t} from '@/lib/locale'
import type {Locale} from '@/lib/types'

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
        {t(about.title, locale, 'About')}
      </h1>
      <div className="mt-10 space-y-16 md:space-y-20">
        {sections.map((section, index) => {
          const body = section.body?.[locale] || section.body?.es || []
          if (!body.length) return null
          return (
            <PortableBody
              key={section._key || `about-section-${index}`}
              value={body as unknown[]}
              locale={locale}
            />
          )
        })}
      </div>
    </div>
  )
}
