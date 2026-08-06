import type {Locale, LocalizedString} from './types'

export function t(
  value: LocalizedString | undefined | null,
  locale: Locale,
  fallback = '',
): string {
  if (!value) return fallback
  return value[locale] || value.es || value.en || fallback
}

export function formatPrice(price: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === 'es' ? 'es-PE' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price)
  return `S/ ${formatted}`
}

export const categoryPaths = {
  joyeria: 'joyeria',
  ceramica: 'ceramica',
  ilustraciones: 'ilustraciones',
  pintura: 'pintura',
  exhibiciones: 'exhibiciones',
  about: 'about',
} as const
