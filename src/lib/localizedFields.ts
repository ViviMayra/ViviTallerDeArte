/** Helpers for walking Sanity localized `{es,en}` fields during translation. */

export type LocalizedString = {es: string; en?: string}
export type LocalizedBlocks = {es: unknown[]; en?: unknown[]}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** `{ es: string, en?: string }` — localizedString / localizedText / optionalLocalizedString */
export function isLocalizedString(value: unknown): value is LocalizedString {
  if (!isPlainObject(value) || typeof value.es !== 'string') return false
  const keys = Object.keys(value)
  if (!keys.every((key) => key === 'es' || key === 'en')) return false
  return value.en === undefined || typeof value.en === 'string'
}

/** `{ es: PortableText[], en?: PortableText[] }` — localizedBlockContent / styled text */
export function isLocalizedBlocks(value: unknown): value is LocalizedBlocks {
  if (!isPlainObject(value) || !Array.isArray(value.es)) return false
  const keys = Object.keys(value)
  return keys.every((key) => key === 'es' || key === 'en')
}

export function collectSpanTexts(blocks: unknown[]): string[] {
  const texts: string[] = []
  const walk = (node: unknown) => {
    if (node == null) return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!isPlainObject(node)) return
    if (
      node._type === 'span' &&
      typeof node.text === 'string' &&
      node.text.trim()
    ) {
      texts.push(node.text)
    }
    for (const child of Object.values(node)) walk(child)
  }
  walk(blocks)
  return texts
}

export function applySpanTexts(blocks: unknown[], translations: string[]): unknown[] {
  const cloned = JSON.parse(JSON.stringify(blocks)) as unknown[]
  let index = 0
  const walk = (node: unknown) => {
    if (node == null) return
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!isPlainObject(node)) return
    if (
      node._type === 'span' &&
      typeof node.text === 'string' &&
      node.text.trim()
    ) {
      if (index < translations.length) {
        node.text = translations[index]
        index += 1
      }
    }
    for (const child of Object.values(node)) walk(child)
  }
  walk(cloned)
  return cloned
}

export function collectLocalized(
  value: unknown,
  path: string,
  stringQueue: {key: string; value: string}[],
  blockPaths: string[],
) {
  if (value == null) return

  if (isLocalizedString(value)) {
    const spanish = value.es.trim()
    if (spanish) {
      stringQueue.push({key: `${path}.en`, value: spanish})
    }
    return
  }

  if (isLocalizedBlocks(value)) {
    // Always re-translate when the action is clicked (overwrite prior EN)
    if (value.es.length > 0) {
      blockPaths.push(path)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectLocalized(item, `${path}[${index}]`, stringQueue, blockPaths)
    })
    return
  }

  if (!isPlainObject(value)) return

  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('_')) continue
    const nextPath = path ? `${path}.${key}` : key
    collectLocalized(child, nextPath, stringQueue, blockPaths)
  }
}

export function successMessage(mode: 'ai' | 'machine' | 'copy', model?: string) {
  if (mode === 'ai') {
    return model ? `Inglés generado (${model}).` : 'Inglés generado.'
  }
  if (mode === 'machine') {
    return 'Inglés traducido (respaldo automático).'
  }
  return 'Inglés copiado del español (la IA no respondió; se usó el texto español como respaldo).'
}
