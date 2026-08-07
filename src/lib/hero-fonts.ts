/** Curated hero fonts + sizes for Studio and the site. */
export const HERO_FONTS = [
  {
    value: 'body',
    title: 'Cuerpo (como siempre)',
    cssVar: '--font-body',
  },
  {
    value: 'display',
    title: 'Título',
    cssVar: '--font-display',
  },
  {
    value: 'serif',
    title: 'Elegante (serif)',
    cssVar: '--font-serif',
  },
  {
    value: 'soft',
    title: 'Suave (serif)',
    cssVar: '--font-soft',
  },
  {
    value: 'script',
    title: 'Cursiva manuscrita',
    cssVar: '--font-script',
  },
] as const

export type HeroFontValue = (typeof HERO_FONTS)[number]['value']

export const HERO_FONT_VARS: Record<HeroFontValue, string> = {
  body: '--font-body',
  display: '--font-display',
  serif: '--font-serif',
  soft: '--font-soft',
  script: '--font-script',
}

/** Pixel sizes shown in Studio (she picks a number). */
export const HERO_SIZES = [
  12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48,
] as const

export type HeroSizeValue = (typeof HERO_SIZES)[number]
