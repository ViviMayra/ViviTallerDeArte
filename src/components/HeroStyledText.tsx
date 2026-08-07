import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {HERO_FONT_VARS, type HeroFontValue} from '@/lib/hero-fonts'

type Variant = 'primary' | 'secondary'

type TextStyleValue = {
  font?: HeroFontValue | string
  size?: number | string
}

const legacySizeClass = {
  sm: 'text-xs md:text-sm',
  md: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
  xl: 'text-lg md:text-xl',
} as const

function fontFamily(font?: string) {
  const key = (font || 'body') as HeroFontValue
  const cssVar = HERO_FONT_VARS[key] || HERO_FONT_VARS.body
  return `var(${cssVar}), Georgia, serif`
}

function resolveSize(size: TextStyleValue['size']): {
  px?: number
  legacyClass?: string
} {
  if (typeof size === 'number' && !Number.isNaN(size)) {
    return {px: size}
  }
  if (typeof size === 'string') {
    if (size in legacySizeClass) {
      return {
        legacyClass: legacySizeClass[size as keyof typeof legacySizeClass],
      }
    }
    const asNum = Number(size)
    if (!Number.isNaN(asNum) && asNum > 0) return {px: asNum}
  }
  return {}
}

function components(variant: Variant): PortableTextComponents {
  // Same left edge + tracking as VIVI; only size/color differ by line
  const baseSize = variant === 'primary' ? 'text-sm' : 'text-xs md:text-sm'
  const baseFont =
    'font-[family-name:var(--font-body)] uppercase tracking-[0.2em]'
  const baseColor =
    variant === 'primary' ? 'text-foreground/90' : 'text-foreground/75'

  return {
    block: {
      normal: ({children}) => (
        <p
          className={`m-0 w-full text-left ${baseSize} ${baseFont} ${baseColor}`}
        >
          {children}
        </p>
      ),
    },
    marks: {
      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
      em: ({children}) => <em className="italic">{children}</em>,
      underline: ({children}) => <span className="underline">{children}</span>,
      sizeSm: ({children}) => (
        <span className={legacySizeClass.sm}>{children}</span>
      ),
      sizeLg: ({children}) => (
        <span className={legacySizeClass.lg}>{children}</span>
      ),
      sizeXl: ({children}) => (
        <span className={legacySizeClass.xl}>{children}</span>
      ),
      fontDisplay: ({children}) => (
        <span
          className="normal-case tracking-normal"
          style={{fontFamily: fontFamily('display')}}
        >
          {children}
        </span>
      ),
      textStyle: ({children, value}) => {
        const style = (value || {}) as TextStyleValue
        const {px, legacyClass} = resolveSize(style.size)
        const usesDisplayLike =
          style.font === 'display' ||
          style.font === 'serif' ||
          style.font === 'soft' ||
          style.font === 'script'

        return (
          <span
            className={[
              usesDisplayLike ? 'normal-case tracking-normal' : '',
              legacyClass || '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              fontFamily: fontFamily(style.font),
              ...(px ? {fontSize: `${px}px`} : {}),
            }}
          >
            {children}
          </span>
        )
      },
    },
  }
}

export function HeroStyledText({
  value,
  variant = 'primary',
  className = '',
}: {
  value?: unknown[] | null
  variant?: Variant
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={`w-full space-y-1 text-left ${className}`.trim()}>
      <PortableText value={value} components={components(variant)} />
    </div>
  )
}
