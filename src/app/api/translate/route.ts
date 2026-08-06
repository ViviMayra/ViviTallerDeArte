import {NextResponse} from 'next/server'
import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '@/sanity/env'

type Body = {
  documentId?: string
  texts?: {key: string; value: string}[]
}

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
            'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns.',
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

function queueLocalized(
  queue: {key: string; value: string}[],
  path: string,
  value: {es?: string; en?: string} | undefined,
) {
  if (!value?.es) return
  queue.push({key: `${path}.en`, value: value.es})
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

    const queue: {key: string; value: string}[] = []

    queueLocalized(queue, 'title', doc.title)
    queueLocalized(queue, 'description', doc.description)
    queueLocalized(queue, 'place', doc.place)
    queueLocalized(queue, 'summary', doc.summary)
    queueLocalized(queue, 'heroEyebrow', doc.heroEyebrow)
    queueLocalized(queue, 'pieceType', doc.pieceType)

    if (Array.isArray(doc.sections)) {
      doc.sections.forEach(
        (
          section: {
            title?: {es?: string; en?: string}
            text?: {es?: string; en?: string}
          },
          index: number,
        ) => {
          queueLocalized(queue, `sections[${index}].title`, section.title)
          queueLocalized(queue, `sections[${index}].text`, section.text)
        },
      )
    }

    const spanishDetails = Array.isArray(doc.details)
      ? doc.details.filter(
          (d: unknown): d is string =>
            typeof d === 'string' && d.trim().length > 0,
        )
      : []

    const shouldCopyBody =
      Boolean(doc.body?.es) &&
      (!doc.body?.en || doc.body.en.length === 0)

    if (!queue.length && !spanishDetails.length && !shouldCopyBody) {
      return NextResponse.json({
        ok: true,
        message: 'No había texto nuevo para traducir.',
      })
    }

    const patch = writeClient.patch(body.documentId)
    const setPayload: Record<string, unknown> = {}

    if (queue.length) {
      const translated = await translateTexts(queue.map((q) => q.value))
      queue.forEach((item, i) => {
        setPayload[item.key] = translated[i]
      })
    }

    if (spanishDetails.length) {
      setPayload.detailsEn = await translateTexts(spanishDetails)
    }

    if (shouldCopyBody) {
      setPayload['body.en'] = doc.body.es
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
