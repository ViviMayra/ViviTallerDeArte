import type {Metadata} from 'next'
import {PRODUCTION_SITE_URL} from '@/lib/site-url'
import type {Locale} from '@/lib/types'

export {PRODUCTION_SITE_URL}
export const SITE_NAME = 'VIVI Taller de Arte'

const defaultDescription = {
  es: 'Joyería artesanal, cerámica, ilustración y pintura hechas en Perú. VIVI Taller de Arte.',
  en: 'Handmade jewelry, ceramics, illustration, and painting made in Peru. VIVI Art Workshop.',
} as const

export function defaultSiteDescription(locale: string) {
  return locale === 'en' ? defaultDescription.en : defaultDescription.es
}

/** Absolute path for a locale, e.g. `/es/joyeria`. */
export function localePath(locale: string, path = '') {
  const normalized = path
    ? path.startsWith('/')
      ? path
      : `/${path}`
    : ''
  return `/${locale}${normalized}`
}

export function pageAlternates(locale: string, path = '') {
  const es = localePath('es', path)
  const en = localePath('en', path)
  return {
    canonical: localePath(locale, path),
    languages: {
      es,
      en,
      'x-default': es,
    },
  }
}

type BuildPageMetadataInput = {
  locale: string
  /** Path without locale, e.g. `/joyeria` or `` for home. */
  path?: string
  title: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
  noIndex?: boolean
}

export function buildPageMetadata({
  locale,
  path = '',
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const desc = description || defaultSiteDescription(locale)
  const images = image ? [{url: image}] : undefined

  return {
    title,
    description: desc,
    alternates: pageAlternates(locale, path),
    openGraph: {
      type,
      locale: locale === 'en' ? 'en_US' : 'es_PE',
      alternateLocale: locale === 'en' ? ['es_PE'] : ['en_US'],
      url: localePath(locale, path),
      siteName: SITE_NAME,
      title,
      description: desc,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : undefined,
    },
    robots: noIndex
      ? {index: false, follow: false}
      : {index: true, follow: true},
  }
}

export function categorySeoCopy(
  category: 'joyeria' | 'ceramica' | 'ilustraciones' | 'pintura' | 'exhibiciones' | 'about',
  locale: Locale,
) {
  const copy = {
    joyeria: {
      es: {
        title: 'Joyería artesanal',
        description:
          'Collares, anillos, aretes y más joyería hecha a mano en Perú. Catálogo de VIVI Taller de Arte.',
      },
      en: {
        title: 'Handmade jewelry',
        description:
          'Necklaces, rings, earrings, and more handmade jewelry from Peru. VIVI Art Workshop catalog.',
      },
    },
    ceramica: {
      es: {
        title: 'Cerámica',
        description:
          'Piezas de cerámica artesanal hechas en Perú. Catálogo de VIVI Taller de Arte.',
      },
      en: {
        title: 'Ceramics',
        description:
          'Handmade ceramic pieces from Peru. VIVI Art Workshop catalog.',
      },
    },
    ilustraciones: {
      es: {
        title: 'Ilustraciones',
        description:
          'Ilustraciones originales y arte gráfico de VIVI Taller de Arte en Perú.',
      },
      en: {
        title: 'Illustrations',
        description:
          'Original illustrations and graphic art from VIVI Art Workshop in Peru.',
      },
    },
    pintura: {
      es: {
        title: 'Pintura',
        description:
          'Pinturas originales hechas en Perú. Catálogo de VIVI Taller de Arte.',
      },
      en: {
        title: 'Painting',
        description:
          'Original paintings made in Peru. VIVI Art Workshop catalog.',
      },
    },
    exhibiciones: {
      es: {
        title: 'Exhibiciones',
        description:
          'Exposiciones y muestra de VIVI Taller de Arte en Perú.',
      },
      en: {
        title: 'Exhibitions',
        description:
          'Exhibitions and shows by VIVI Art Workshop in Peru.',
      },
    },
    about: {
      es: {
        title: 'Nosotros',
        description:
          'Conoce a VIVI Taller de Arte: joyería y arte hecho a mano en Perú.',
      },
      en: {
        title: 'About',
        description:
          'Meet VIVI Art Workshop: handmade jewelry and art from Peru.',
      },
    },
  } as const

  return copy[category][locale === 'en' ? 'en' : 'es']
}
