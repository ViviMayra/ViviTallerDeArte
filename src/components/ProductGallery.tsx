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
