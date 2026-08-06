import type {Locale} from './types'
import type {SanityImage} from './types'
import {t} from './locale'
import {urlFor} from '@/sanity/lib/image'

export function getImageUrl(
  image: SanityImage | undefined | null,
  width = 1200,
): string | undefined {
  if (!image) return undefined
  if (image.url) return image.url
  const builder = urlFor(image)
  if (!builder) return undefined
  return builder.width(width).auto('format').url()
}

export function getImageAlt(
  image: SanityImage | undefined | null,
  locale: Locale,
  fallback = '',
): string {
  return t(image?.alt, locale, fallback)
}
