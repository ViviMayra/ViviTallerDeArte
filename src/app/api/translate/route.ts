import {NextResponse} from 'next/server'
import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '@/sanity/env'
import {translateTexts} from '@/lib/translate'

type Body = {
  documentId?: string
  texts?: {key: string; value: string}[]
}

type LocalizedString = {es: string; en?: string}
type LocalizedBlocks = {es: unknown[]; en?: unknown[]}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** `{ es: string, en?: string }` — localizedString / localizedText / optionalLocalizedString */
function isLocalizedString(value: unknown): value is LocalizedString {
  if (!isPlainObject(value) || typeof value.es !== 'string') return false
  const keys = Object.keys(value)
  if (!keys.every((key) => key === 'es' || key === 'en')) return false
  return value.en === undefined || typeof value.en === 'string'
}

/** `{ es: PortableText[], en?: PortableText[] }` — localizedBlockContent / styled text */
function isLocalizedBlocks(value: unknown): value is LocalizedBlocks {
  if (!isPlainObject(value) || !Array.isArray(value.es)) return false
  const keys = Object.keys(value)
  return keys.every((key) => key === 'es' || key === 'en')
}

function collectSpanTexts(blocks: unknown[]): string[] {
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

function applySpanTexts(blocks: unknown[], translations: string[]): unknown[] {
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

function collectLocalized(
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

function successMessage(mode: 'ai' | 'copy', model?: string) {
  if (mode === 'ai') {
    return model
      ? `Inglés generado (${model}).`
      : 'Inglés generado.'
  }
  return 'Inglés copiado del español (la IA no respondió; se usó el texto español como respaldo).'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body

    if (body.texts?.length) {
      const result = await translateTexts(body.texts.map((t) => t.value))
      return NextResponse.json({
        mode: result.mode,
        model: result.model,
        fallbackReason: result.fallbackReason,
        translations: body.texts.map((item, i) => ({
          key: item.key,
          value: result.translations[i],
        })),
      })
    }

    if (!body.documentId) {
      return NextResponse.json(
        {error: 'documentId or texts required'},
        {status: 400},
      )
    }

    if (!hasSanityConfig || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            'Falta SANITY_API_WRITE_TOKEN en .env.local (token Editor en sanity.io/manage → API).',
        },
        {status: 400},
      )
    }

    const writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })

    const doc = await writeClient.getDocument(body.documentId)
    if (!doc) {
      return NextResponse.json(
        {error: 'Documento no encontrado. Guarda primero, luego traduce.'},
        {status: 404},
      )
    }

    const stringQueue: {key: string; value: string}[] = []
    const blockPaths: string[] = []
    collectLocalized(doc, '', stringQueue, blockPaths)

    const spanishDetails = Array.isArray(doc.details)
      ? doc.details.filter(
          (d: unknown): d is string =>
            typeof d === 'string' && d.trim().length > 0,
        )
      : []

    if (!stringQueue.length && !spanishDetails.length && !blockPaths.length) {
      return NextResponse.json({
        ok: true,
        mode: 'ai',
        message: 'No había texto nuevo para traducir.',
      })
    }

    const patch = writeClient.patch(body.documentId)
    const setPayload: Record<string, unknown> = {}
    let mode: 'ai' | 'copy' = 'ai'
    let model: string | undefined
    let fallbackReason: string | undefined

    if (stringQueue.length) {
      const result = await translateTexts(stringQueue.map((q) => q.value))
      mode = result.mode
      model = result.model
      fallbackReason = result.fallbackReason
      stringQueue.forEach((item, i) => {
        setPayload[item.key] = result.translations[i]
      })
    }

    if (spanishDetails.length) {
      const result = await translateTexts(spanishDetails)
      if (result.mode === 'copy') {
        mode = 'copy'
        fallbackReason = result.fallbackReason || fallbackReason
      }
      model = model || result.model
      setPayload.detailsEn = result.translations
    }

    // Block content: translate span text, keep marks/structure
    for (const path of blockPaths) {
      const parts = path.split('.')
      let cursor: unknown = doc
      for (const part of parts) {
        if (!isPlainObject(cursor)) {
          cursor = undefined
          break
        }
        cursor = cursor[part]
      }
      if (!isLocalizedBlocks(cursor) || !cursor.es) continue

      const spanTexts = collectSpanTexts(cursor.es)
      if (!spanTexts.length) {
        setPayload[`${path}.en`] = cursor.es
        continue
      }
      const result = await translateTexts(spanTexts)
      if (result.mode === 'copy') {
        mode = 'copy'
        fallbackReason = result.fallbackReason || fallbackReason
      }
      model = model || result.model
      setPayload[`${path}.en`] = applySpanTexts(cursor.es, result.translations)
    }

    await patch.set(setPayload).commit()

    return NextResponse.json({
      ok: true,
      mode,
      model,
      fallbackReason,
      patched: Object.keys(setPayload),
      message: successMessage(mode, model),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Translate failed',
      },
      {status: 500},
    )
  }
}
