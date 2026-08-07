import {PortableText, type PortableTextComponents} from '@portabletext/react'

type Variant = 'primary' | 'secondary'

type TextStyleValue = {
  font?: 'body' | 'display'
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClass: Record<NonNullable<TextStyleValue['size']>, string> = {
  sm: 'text-xs md:text-sm',
  md: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
  xl: 'text-lg md:text-xl',
}

const fontClass: Record<NonNullable<TextStyleValue['font']>, string> = {
  body: 'font-[family-name:var(--font-body)]',
  display: 'font-[family-name:var(--font-display)]',
}

function components(variant: Variant): PortableTextComponents {
  const baseSize = variant === 'primary' ? 'text-sm' : 'text-xs md:text-sm'
  // Same tracking on both lines so every line shares one left edge with VIVI
  const baseFont =
    'font-[family-name:var(--font-body)] uppercase tracking-[0.2em]'
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
      textStyle: ({children, value}) => {
        const style = (value || {}) as TextStyleValue
        const classes = [
          style.font ? fontClass[style.font] : '',
          style.size ? sizeClass[style.size] : '',
          // Keep left edge; only drop wide tracking for display font
          style.font === 'display' ? 'normal-case tracking-normal' : '',
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
