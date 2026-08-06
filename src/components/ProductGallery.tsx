'use client'

import {useState} from 'react'
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
  const [active, setActive] = useState(0)
  const current = photos[active] || photos[0]
  const src = getImageUrl(current, 1400)

  return (
    <div>
      <div
        className={`relative aspect-square overflow-hidden bg-line ${sold ? 'opacity-75' : ''}`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={getImageAlt(current, locale, title)}
            className={`h-full w-full object-cover ${sold ? 'grayscale-[25%]' : ''}`}
          />
        ) : null}
      </div>
      {photos.length > 1 && (
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
      )}
    </div>
  )
}
