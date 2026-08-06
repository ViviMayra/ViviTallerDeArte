'use client'

import {useEffect, useState} from 'react'
import type {Locale, SanityImage} from '@/lib/types'
import {getImageAlt, getImageUrl} from '@/lib/images'

export function ImageCarousel({
  slides,
  locale,
}: {
  slides: SanityImage[]
  locale: Locale
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [slides.length])

  if (!slides.length) return null
  const current = slides[index]
  const src = getImageUrl(current, 1600)

  return (
    <div className="relative mt-10 overflow-hidden bg-line">
      <div className="aspect-[16/9] w-full md:aspect-[21/9]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={getImageAlt(current, locale)}
            className="h-full w-full object-cover transition-opacity duration-700"
          />
        ) : null}
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 w-6 ${i === index ? 'bg-ochre' : 'bg-background/70'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
