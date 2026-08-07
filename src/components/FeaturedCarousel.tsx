'use client'

import {useEffect, useMemo, useState} from 'react'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/navigation'
import {SoldBadge} from '@/components/SoldBadge'
import {formatPrice, t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import type {FeaturedCarouselSlide, Locale} from '@/lib/types'

type Props = {
  slides: FeaturedCarouselSlide[]
  title?: string
  locale: Locale
}

export function FeaturedCarousel({slides, title, locale}: Props) {
  const common = useTranslations('common')
  const validSlides = useMemo(
    () =>
      slides.filter((slide) => {
        if (slide._type === 'photoSlide') {
          return Boolean(getImageUrl(slide.image, 1600))
        }
        return Boolean(
          slide.piece &&
            slide.piece.status !== 'hidden' &&
            slide.piece.slug,
        )
      }),
    [slides],
  )
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [validSlides.length])

  useEffect(() => {
    if (validSlides.length < 2) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % validSlides.length)
    }, 5000)
    return () => window.clearInterval(id)
  }, [validSlides.length])

  if (!validSlides.length) return null

  const current = validSlides[index % validSlides.length]

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
      {title ? (
        <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.12em] md:text-3xl">
          {title}
        </h2>
      ) : null}

      <div className="relative overflow-hidden">
        {current._type === 'photoSlide' ? (
          <div className="aspect-[16/9] w-full overflow-hidden bg-line md:aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current._key}
              src={getImageUrl(current.image, 1600) || ''}
              alt={getImageAlt(current.image, locale)}
              className="h-full w-full object-cover animate-fade-up"
            />
          </div>
        ) : current.piece ? (
          <div className="flex justify-center bg-gradient-to-b from-[#f3efe6]/80 to-transparent px-4 py-8 md:py-12">
            <Link
              key={current._key}
              href={`/pieza/${current.piece.slug}`}
              className={`piece-card group block w-full max-w-sm animate-fade-up ${
                current.piece.status === 'sold' ? 'is-sold' : ''
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-line">
                {getImageUrl(current.piece.photos?.[0], 900) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(current.piece.photos?.[0], 900) || ''}
                    alt={getImageAlt(
                      current.piece.photos?.[0],
                      locale,
                      t(current.piece.title, locale),
                    )}
                    className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
                      current.piece.status === 'sold'
                        ? 'group-hover:grayscale-[30%] group-hover:brightness-95'
                        : ''
                    }`}
                  />
                ) : null}
                {current.piece.status === 'sold' ? (
                  <SoldBadge label={common('sold')} />
                ) : null}
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-sm uppercase tracking-[0.08em]">
                  {t(current.piece.title, locale)}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    current.piece.status === 'sold'
                      ? 'text-sold'
                      : 'text-muted'
                  }`}
                >
                  {formatPrice(current.piece.price, locale)}
                </p>
              </div>
            </Link>
          </div>
        ) : null}

        {validSlides.length > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-2">
            {validSlides.map((slide, i) => (
              <button
                key={slide._key}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-6 transition-colors ${
                  i === index ? 'bg-ochre' : 'bg-line'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
