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
    // Without an API key, copy Spanish → English so the site has EN strings;
    // Mayra (or you) can refine later, or add TRANSLATE_API_KEY for real MT.
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
  overwrite = true,
) {
  if (!value?.es) return
  if (!overwrite && value.en) return
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

    if (Array.isArray(doc.details)) {
      doc.details.forEach(
        (detail: {es?: string; en?: string}, index: number) => {
          if (detail?.es) {
            queue.push({key: `details[${index}].en`, value: detail.es})
          }
        },
      )
    }

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

    // About portable text: copy Spanish blocks to English if empty
    if (doc.body?.es && (!doc.body.en || doc.body.en.length === 0)) {
      // Can't easily MT portable text without API; copy structure as fallback
      // Real MT would need block walk — for now set via client
    }

    if (!queue.length && !(doc.body?.es && (!doc.body?.en || !doc.body.en.length))) {
      return NextResponse.json({
        ok: true,
        message: 'No había texto nuevo para traducir.',
      })
    }

    const patch = writeClient.patch(body.documentId)

    if (queue.length) {
      const translated = await translateTexts(queue.map((q) => q.value))
      const setPayload: Record<string, string> = {}
      queue.forEach((item, i) => {
        setPayload[item.key] = translated[i]
      })
      patch.set(setPayload)
    }

    if (doc.body?.es && (!doc.body.en || doc.body.en.length === 0)) {
      // Copy Spanish portable text as English baseline (images/structure preserved)
      patch.set({'body.en': doc.body.es})
    }

    await patch.commit()

    return NextResponse.json({
      ok: true,
      patched: queue.map((q) => q.key),
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
