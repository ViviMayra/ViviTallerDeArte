import type {Locale, LocalizedStyledText} from './types'

/** Flatten portable text blocks (or null) to a single plain string. */
export function blocksToPlainText(blocks: unknown[] | null): string {
  if (!blocks?.length) return ''
  return blocks
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      const children = (block as {children?: unknown}).children
      if (!Array.isArray(children)) return ''
      return children
        .map((child) => {
          if (!child || typeof child !== 'object') return ''
          const text = (child as {text?: unknown}).text
          return typeof text === 'string' ? text : ''
        })
        .join('')
    })
    .filter(Boolean)
    .join(' ')
}

export function plainTextToBlocks(text: string) {
  return [
    {
      _type: 'block',
      _key: 'plain',
      style: 'normal',
      markDefs: [] as {_key: string; _type: string}[],
      children: [
        {
          _type: 'span',
          _key: 's0',
          text,
          marks: [] as string[],
        },
      ],
    },
  ]
}

/** Resolve localized styled text (or legacy plain string) to portable blocks. */
export function getStyledBlocks(
  value: LocalizedStyledText | undefined | null,
  locale: Locale,
  fallback = '',
): unknown[] | null {
  if (!value) {
    return fallback ? plainTextToBlocks(fallback) : null
  }

  const raw = value[locale] ?? value.es ?? value.en
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed) return plainTextToBlocks(trimmed)
    return fallback ? plainTextToBlocks(fallback) : null
  }

  if (Array.isArray(raw) && raw.length > 0) return raw

  const other =
    locale === 'es' ? value.en : value.es
  if (typeof other === 'string' && other.trim()) {
    return plainTextToBlocks(other.trim())
  }
  if (Array.isArray(other) && other.length > 0) return other

  return fallback ? plainTextToBlocks(fallback) : null
}
