import createImageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'
import {dataset, projectId, hasSanityConfig} from '../env'

const builder = hasSanityConfig
  ? createImageUrlBuilder({projectId, dataset})
  : null

export function urlFor(source: SanityImageSource) {
  if (!builder) return null
  return builder.image(source)
}
