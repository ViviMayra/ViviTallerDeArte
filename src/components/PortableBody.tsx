import {PortableText, type PortableTextComponents} from '@portabletext/react'
import type {Locale} from '@/lib/types'
import {getImageAlt, getImageUrl} from '@/lib/images'
import type {SanityImage} from '@/lib/types'

function imageWidthPercent(value: SanityImage): number {
  const raw = value.widthPercent
  if (typeof raw !== 'number' || Number.isNaN(raw)) return 100
  return Math.min(100, Math.max(10, Math.round(raw)))
}

const components = (locale: Locale): PortableTextComponents => ({
  types: {
    image: ({value}: {value: SanityImage}) => {
      const src = getImageUrl(value, 1400)
      if (!src) return null
      const widthPercent = imageWidthPercent(value)
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={getImageAlt(value, locale)}
          className="my-8 max-w-full object-cover"
          style={{width: `${widthPercent}%`}}
        />
      )
    },
  },
  block: {
    h2: ({children}) => (
      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl">
        {children}
      </h3>
    ),
    normal: ({children}) => (
      <p className="mt-4 leading-relaxed text-muted">{children}</p>
    ),
  },
})

export function PortableBody({
  value,
  locale,
}: {
  value?: unknown[]
  locale: Locale
}) {
  if (!value?.length) return null
  return (
    <div className="max-w-2xl">
      <PortableText value={value} components={components(locale)} />
    </div>
  )
}
