import {NextResponse} from 'next/server'
import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId, hasSanityConfig} from '@/sanity/env'
import {translateTexts} from '@/lib/translate'
import {
  applySpanTexts,
  collectLocalized,
  collectSpanTexts,
  isLocalizedBlocks,
  isPlainObject,
  successMessage,
} from '@/lib/localizedFields'

type Body = {
  documentId?: string
  texts?: {key: string; value: string}[]
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body

    // Studio path: translate plain strings only; client writes with user session
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

    // Optional server-side path (scripts / when write token is configured)
    if (!hasSanityConfig || !process.env.SANITY_API_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            'Traducción del documento no disponible en el servidor. Usa el botón en Studio (sesión de editor).',
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
    let mode: 'ai' | 'machine' | 'copy' = 'ai'
    let model: string | undefined
    let fallbackReason: string | undefined

    const noteResult = (result: Awaited<ReturnType<typeof translateTexts>>) => {
      if (result.mode === 'copy') mode = 'copy'
      else if (result.mode === 'machine' && mode === 'ai') mode = 'machine'
      model = model || result.model
      if (result.fallbackReason) fallbackReason = result.fallbackReason
    }

    if (stringQueue.length) {
      const result = await translateTexts(stringQueue.map((q) => q.value))
      noteResult(result)
      stringQueue.forEach((item, i) => {
        setPayload[item.key] = result.translations[i]
      })
    }

    if (spanishDetails.length) {
      const result = await translateTexts(spanishDetails)
      noteResult(result)
      setPayload.detailsEn = result.translations
    }

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
      noteResult(result)
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
