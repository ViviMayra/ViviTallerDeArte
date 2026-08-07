import type {Locale} from './types'
import type {SanityImage} from './types'
import {t} from './locale'
import {urlFor} from '@/sanity/lib/image'

export function getImageUrl(
  image: SanityImage | undefined | null,
  width = 1200,
  options?: {fit?: 'crop' | 'max'; quality?: number; autoFormat?: boolean},
): string | undefined {
  if (!image) return undefined
  if (image.url) return image.url
  // Incomplete Studio uploads (image object without asset) must not crash the build
  if (!image.asset?._ref && !image.asset?.url) return undefined
  const builder = urlFor(image)
  if (!builder) return undefined
  try {
    const fit = options?.fit || 'crop'
    // Hotspot/crop from Studio guides the fill when the photo isn’t the ideal size.
    let req = builder.width(width).fit(fit)
    if (options?.quality != null) req = req.quality(options.quality)
    if (options?.autoFormat !== false) req = req.auto('format')
    return req.url() || undefined
  } catch {
    return undefined
  }
}

export function getImageAlt(
  image: SanityImage | undefined | null,
  locale: Locale,
  fallback = '',
): string {
  return t(image?.alt, locale, fallback)
}

/** CSS object-position from Sanity hotspot (keeps focus when object-cover crops). */
export function getImageObjectPosition(
  image?: SanityImage | null,
): string | undefined {
  const x = image?.hotspot?.x
  const y = image?.hotspot?.y
  if (typeof x !== 'number' || typeof y !== 'number') return undefined
  return `${Math.round(x * 1000) / 10}% ${Math.round(y * 1000) / 10}%`
}
