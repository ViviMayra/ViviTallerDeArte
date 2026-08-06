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
    // Deterministic placeholder so Studio still works without a key:
    // copy Spanish as English draft for manual editing.
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
            'Sanity write token / project not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.',
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
      return NextResponse.json({error: 'Document not found'}, {status: 404})
    }

    const patch: Record<string, string> = {}
    const queue: {key: string; value: string}[] = []

    if (doc.title?.es && !doc.title?.en) {
      queue.push({key: 'title.en', value: doc.title.es})
    }
    if (doc.description?.es && !doc.description?.en) {
      queue.push({key: 'description.en', value: doc.description.es})
    }
    if (Array.isArray(doc.details)) {
      doc.details.forEach((detail: {es?: string; en?: string}, index: number) => {
        if (detail?.es && !detail?.en) {
          queue.push({key: `details[${index}].en`, value: detail.es})
        }
      })
    }

    if (!queue.length) {
      return NextResponse.json({
        ok: true,
        message: 'Nothing to translate (English fields already filled).',
      })
    }

    const translated = await translateTexts(queue.map((q) => q.value))
    queue.forEach((item, i) => {
      patch[item.key] = translated[i]
    })

    await writeClient.patch(body.documentId).set(patch).commit()

    return NextResponse.json({ok: true, patched: Object.keys(patch)})
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Translate failed',
      },
      {status: 500},
    )
  }
}
