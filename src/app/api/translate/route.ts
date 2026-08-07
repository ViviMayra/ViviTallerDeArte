import {NextResponse} from 'next/server'
import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '@/sanity/env'

type Body = {
  documentId?: string
  texts?: {key: string; value: string}[]
}

type LocalizedString = {es: string; en?: string}
type LocalizedBlocks = {es: unknown[]; en?: unknown[]}

async function translateTexts(texts: string[]): Promise<string[]> {
  const apiKey = process.env.TRANSLATE_API_KEY
  if (!apiKey) {
    return texts.map((text) => text)
  }

  const url =
    process.env.TRANSLATE_API_URL ||
    'https://api.openai.com/v1/chat/completions'
  const model = process.env.TRANSLATE_MODEL || 'gpt-4o-mini'

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns. Preserve line breaks exactly when present.',
        },
        {
          role: 'user',
          content: JSON.stringify(texts),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Translate API failed: ${response.status}`)
  }

  const json = (await response.json()) as {
    choices?: {message?: {content?: string}}[]
  }
  const content = json.choices?.[0]?.message?.content || '[]'
  const parsed = JSON.parse(content) as string[]
  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error('Unexpected translate response shape')
  }
  return parsed
}

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
    if (value.es.length > 0 && (!value.en || value.en.length === 0)) {
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body

    if (body.texts?.length) {
      const translated = await translateTexts(body.texts.map((t) => t.value))
      return NextResponse.json({
        translations: body.texts.map((item, i) => ({
          key: item.key,
          value: translated[i],
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
        message: 'No había texto nuevo para traducir.',
      })
    }

    const patch = writeClient.patch(body.documentId)
    const setPayload: Record<string, unknown> = {}

    if (stringQueue.length) {
      const translated = await translateTexts(stringQueue.map((q) => q.value))
      stringQueue.forEach((item, i) => {
        setPayload[item.key] = translated[i]
      })
    }

    if (spanishDetails.length) {
      setPayload.detailsEn = await translateTexts(spanishDetails)
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
      const translatedSpans = await translateTexts(spanTexts)
      setPayload[`${path}.en`] = applySpanTexts(cursor.es, translatedSpans)
    }

    await patch.set(setPayload).commit()

    return NextResponse.json({
      ok: true,
      patched: Object.keys(setPayload),
      message: process.env.TRANSLATE_API_KEY
        ? 'Inglés generado.'
        : 'Inglés copiado del español (agrega TRANSLATE_API_KEY para traducción automática real).',
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
