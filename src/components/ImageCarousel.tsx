'use client'

import {useEffect, useRef, useState} from 'react'
import type {Locale, SanityImage} from '@/lib/types'
import {getImageAlt, getImageUrl} from '@/lib/images'

const GAP_PX = 16

function useVisibleCount() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const mqMd = window.matchMedia('(min-width: 768px)')
    const mqSm = window.matchMedia('(min-width: 640px)')

    const update = () => {
      if (mqMd.matches) setVisible(3)
      else if (mqSm.matches) setVisible(2)
      else setVisible(1)
    }

    update()
    mqMd.addEventListener('change', update)
    mqSm.addEventListener('change', update)
    return () => {
      mqMd.removeEventListener('change', update)
      mqSm.removeEventListener('change', update)
    }
  }, [])

  return visible
}

export function ImageCarousel({
  slides,
  locale,
}: {
  slides: SanityImage[]
  locale: Locale
}) {
  const visibleCount = useVisibleCount()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [index, setIndex] = useState(0)

  const validSlides = slides.filter((slide) => Boolean(getImageUrl(slide, 900)))
  const maxIndex = Math.max(0, validSlides.length - visibleCount)
  const canNavigate = validSlides.length > visibleCount

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    const update = () => setViewportWidth(el.clientWidth)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex, validSlides.length])

  useEffect(() => {
    if (!canNavigate) return
    const id = window.setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1))
    }, 4500)
    return () => window.clearInterval(id)
  }, [canNavigate, maxIndex, index])

  if (!validSlides.length) return null

  const goPrev = () => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1))
  }
  const goNext = () => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1))
  }

  const cardWidth =
    viewportWidth > 0
      ? (viewportWidth - (visibleCount - 1) * GAP_PX) / visibleCount
      : 0
  const offset = index * (cardWidth + GAP_PX)

  return (
    <div className="relative mt-10">
      <div className="relative bg-gradient-to-b from-[#f3efe6]/80 to-transparent px-10 py-6 md:px-14 md:py-8">
        <div ref={viewportRef} className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap: GAP_PX,
              transform: cardWidth > 0 ? `translateX(-${offset}px)` : undefined,
            }}
          >
            {validSlides.map((slide, i) => (
              <div
                key={slide.asset?._ref || slide.url || `slide-${i}`}
                className="shrink-0"
                style={
                  cardWidth > 0
                    ? {width: cardWidth}
                    : {width: `${100 / visibleCount}%`}
                }
              >
                <div className="relative aspect-square overflow-hidden bg-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(slide, 900) || ''}
                    alt={getImageAlt(slide, locale)}
                    className="h-full w-full object-cover"
                  />
                </div>
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
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({length: maxIndex + 1}, (_, i) => (
            <button
              key={i}
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
