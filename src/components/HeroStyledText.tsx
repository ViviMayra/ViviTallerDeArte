import {PortableText, type PortableTextComponents} from '@portabletext/react'

type Variant = 'primary' | 'secondary'

type TextStyleValue = {
  font?: 'body' | 'display'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClass = {
  sm: 'text-xs md:text-sm',
  md: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
  xl: 'text-lg md:text-xl',
} as const

function components(variant: Variant): PortableTextComponents {
  // Previous defaults: body font; primary = uppercase wide tracking, secondary = softer
  const baseSize = variant === 'primary' ? 'text-sm' : 'text-xs md:text-sm'
  const baseFont =
    variant === 'primary'
      ? 'font-[family-name:var(--font-body)] uppercase tracking-[0.2em]'
      : 'font-[family-name:var(--font-body)] tracking-[0.04em]'
  const baseColor =
    variant === 'primary' ? 'text-foreground/90' : 'text-foreground/75'

  return {
    block: {
      normal: ({children}) => (
        <p className={`m-0 text-left ${baseSize} ${baseFont} ${baseColor}`}>
          {children}
        </p>
      ),
    },
    marks: {
      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
      em: ({children}) => <em className="italic">{children}</em>,
      underline: ({children}) => <span className="underline">{children}</span>,
      sizeSm: ({children}) => <span className={sizeClass.sm}>{children}</span>,
      sizeLg: ({children}) => <span className={sizeClass.lg}>{children}</span>,
      sizeXl: ({children}) => <span className={sizeClass.xl}>{children}</span>,
      // Legacy marks (older Studio builds) — still render if present
      fontDisplay: ({children}) => (
        <span className="font-[family-name:var(--font-display)] normal-case tracking-normal">
          {children}
        </span>
      ),
      textStyle: ({children, value}) => {
        const style = (value || {}) as TextStyleValue
        const classes = [
          style.font === 'display'
            ? 'font-[family-name:var(--font-display)] normal-case tracking-normal'
            : '',
          style.size === 'sm'
            ? sizeClass.sm
            : style.size === 'lg'
              ? sizeClass.lg
              : style.size === 'xl'
                ? sizeClass.xl
                : style.size === 'md'
                  ? sizeClass.md
                  : '',
        ]
          .filter(Boolean)
          .join(' ')
        return <span className={classes}>{children}</span>
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
    <div className={`space-y-1 text-left ${className}`.trim()}>
      <PortableText value={value} components={components(variant)} />
    </div>
  )
}
