'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import {useTranslations} from 'next-intl'
import {Link} from '@/i18n/navigation'
import {SoldBadge} from '@/components/SoldBadge'
import {formatPrice, t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import {
  useCarouselVisibleCount,
  useInfiniteCarousel,
} from '@/lib/use-infinite-carousel'
import type {FeaturedCarouselSlide, Locale} from '@/lib/types'

type Props = {
  slides: FeaturedCarouselSlide[]
  title?: string
  locale: Locale
}

const GAP_PX = 16

export function FeaturedCarousel({slides, title, locale}: Props) {
  const common = useTranslations('common')
  const visibleCount = useCarouselVisibleCount()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)

  const validSlides = useMemo(
    () =>
      slides.filter((slide) => {
        if (slide._type === 'photoSlide') {
          return Boolean(getImageUrl(slide.image, 900))
        }
        return Boolean(
          slide.piece &&
            slide.piece.status !== 'hidden' &&
            slide.piece.slug,
        )
      }),
    [slides],
  )

  const {
    index,
    activeDot,
    canNavigate,
    transitionOn,
    goPrev,
    goNext,
    goTo,
    onTransitionEnd,
    cloneCount,
  } = useInfiniteCarousel(validSlides.length, visibleCount, 5000)

  const trackSlides = useMemo(() => {
    if (!cloneCount) return validSlides
    return [...validSlides, ...validSlides.slice(0, cloneCount)]
  }, [validSlides, cloneCount])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const update = () => setViewportWidth(el.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!validSlides.length) return null

  const cardWidth =
    viewportWidth > 0
      ? (viewportWidth - (visibleCount - 1) * GAP_PX) / visibleCount
      : 0
  const offset = index * (cardWidth + GAP_PX)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
      {title ? (
        <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.12em] md:text-3xl">
          {title}
        </h2>
      ) : null}

      <div className="relative">
        <div className="relative bg-gradient-to-b from-[#f3efe6]/80 to-transparent px-10 py-8 md:px-14 md:py-12">
          <div ref={viewportRef} className="overflow-hidden">
            <div
              className="flex ease-out"
              style={{
                gap: GAP_PX,
                transform:
                  cardWidth > 0 ? `translateX(-${offset}px)` : undefined,
                transition: transitionOn
                  ? 'transform 500ms ease-out'
                  : 'none',
              }}
              onTransitionEnd={onTransitionEnd}
            >
              {trackSlides.map((slide, i) => (
                <div
                  key={`${slide._key}-${i}`}
                  className="shrink-0"
                  style={
                    cardWidth > 0
                      ? {width: cardWidth}
                      : {width: `${100 / visibleCount}%`}
                  }
                >
                  <SlideCard
                    slide={slide}
                    locale={locale}
                    soldLabel={common('sold')}
                  />
                </div>
              ))}
            </div>
          </div>

          {canNavigate ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-background/75 text-foreground shadow-sm backdrop-blur-[2px] transition hover:bg-background md:h-11 md:w-11"
              >
                <ChevronLeft />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-background/75 text-foreground shadow-sm backdrop-blur-[2px] transition hover:bg-background md:h-11 md:w-11"
              >
                <ChevronRight />
              </button>
            </>
          ) : null}
        </div>

        {canNavigate ? (
          <div className="mt-6 flex items-center justify-center gap-2">
            {validSlides.map((slide, i) => (
              <button
                key={slide._key}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 w-6 transition-colors ${
                  i === activeDot ? 'bg-ochre' : 'bg-line'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function SlideCard({
  slide,
  locale,
  soldLabel,
}: {
  slide: FeaturedCarouselSlide
  locale: Locale
  soldLabel: string
}) {
  if (slide._type === 'photoSlide') {
    return (
      <div className="w-full">
        <div className="relative aspect-square overflow-hidden bg-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getImageUrl(slide.image, 900) || ''}
            alt={getImageAlt(slide.image, locale)}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    )
  }

  if (!slide.piece) return null

  const piece = slide.piece
  const sold = piece.status === 'sold'

  return (
    <Link
      href={`/pieza/${piece.slug}`}
      className={`piece-card group block w-full ${sold ? 'is-sold' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-line">
        {getImageUrl(piece.photos?.[0], 900) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(piece.photos?.[0], 900) || ''}
            alt={getImageAlt(
              piece.photos?.[0],
              locale,
              t(piece.title, locale),
            )}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
              sold ? 'group-hover:grayscale-[30%] group-hover:brightness-95' : ''
            }`}
          />
        ) : null}
        {sold ? <SoldBadge label={soldLabel} /> : null}
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm uppercase tracking-[0.08em]">
          {t(piece.title, locale)}
        </h3>
        <p className={`mt-1 text-sm ${sold ? 'text-sold' : 'text-muted'}`}>
          {formatPrice(piece.price, locale)}
        </p>
      </div>
    </Link>
  )
}

function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 5L8 12L15 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
