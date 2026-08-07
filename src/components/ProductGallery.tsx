'use client'

import {useState} from 'react'
import {useTranslations} from 'next-intl'
import {SoldBadge} from '@/components/SoldBadge'
import type {Locale, SanityImage} from '@/lib/types'
import {getImageAlt, getImageUrl} from '@/lib/images'

export function ProductGallery({
  photos,
  locale,
  sold,
  title,
}: {
  photos: SanityImage[]
  locale: Locale
  sold?: boolean
  title: string
}) {
  const common = useTranslations('common')
  const [active, setActive] = useState(0)
  const current = photos[active] || photos[0]
  const src = getImageUrl(current, 1400)
  const canNavigate = photos.length > 1

  const goPrev = () => {
    setActive((i) => (i - 1 + photos.length) % photos.length)
  }

  const goNext = () => {
    setActive((i) => (i + 1) % photos.length)
  }

  return (
    <div>
      <div
        className={`group relative aspect-square overflow-hidden bg-line ${
          sold ? 'is-sold' : ''
        }`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={getImageAlt(current, locale, title)}
            className={`h-full w-full object-cover transition duration-500 ${
              sold
                ? 'group-hover:grayscale-[30%] group-hover:brightness-95'
                : ''
            }`}
          />
        ) : null}
        {sold && <SoldBadge label={common('sold')} />}

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
              className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-55 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition hover:opacity-95 md:left-3 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-55 md:hover:opacity-95"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
              className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-55 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition hover:opacity-95 md:right-3 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-55 md:hover:opacity-95"
            >
              <ChevronRight />
            </button>
          </>
        ) : null}
      </div>
      {canNavigate ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => {
            const thumb = getImageUrl(photo, 200)
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden border ${
                  index === active ? 'border-ochre-deep' : 'border-transparent'
                }`}
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
