import type {SanityClient} from 'sanity'
import {
  applySpanTexts,
  collectLocalized,
  collectSpanTexts,
  isLocalizedBlocks,
  isPlainObject,
  successMessage,
} from '@/lib/localizedFields'

type TranslateApiResponse = {
  error?: string
  mode?: 'ai' | 'machine' | 'copy'
  model?: string
  fallbackReason?: string
  translations?: {key: string; value: string}[]
}

async function translateTextsBatch(texts: {key: string; value: string}[]) {
  if (!texts.length) {
    return {
      mode: 'ai' as const,
      model: undefined as string | undefined,
      byKey: {} as Record<string, string>,
    }
  }

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({texts}),
  })
  const data = (await response.json()) as TranslateApiResponse
  if (!response.ok) {
    throw new Error(data.error || 'Error al traducir')
  }

  const byKey: Record<string, string> = {}
  for (const item of data.translations || []) {
    byKey[item.key] = item.value
  }

  return {
    mode: data.mode || ('copy' as const),
    model: data.model,
    byKey,
  }
}

function getAtPath(doc: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let cursor: unknown = doc
  for (const part of parts) {
    if (!isPlainObject(cursor)) return undefined
    cursor = cursor[part]
  }
  return cursor
}

export type StudioTranslateResult = {
  ok: true
  mode: 'ai' | 'machine' | 'copy'
  model?: string
  message: string
}

/**
 * Translate Spanish → English using the free /api/translate text endpoint,
 * then write EN fields with the logged-in Studio user's Sanity client.
 * No SANITY_API_WRITE_TOKEN required on the server.
 */
export async function translateDocumentWithClient(
  client: SanityClient,
  documentId: string,
): Promise<StudioTranslateResult> {
  const publishedId = String(documentId).replace(/^drafts\./, '')
  const draftId = `drafts.${publishedId}`

  // Prefer draft (what Mayra is editing); fall back to published
  const doc =
    (await client.getDocument(draftId)) ||
    (await client.getDocument(publishedId))
  const targetId = doc?._id

  if (!doc || !targetId) {
    throw new Error('Documento no encontrado. Guarda primero, luego traduce.')
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
    return {
      ok: true,
      mode: 'ai',
      message: 'No había texto nuevo para traducir.',
    }
  }

  const setPayload: Record<string, unknown> = {}
  let mode: 'ai' | 'machine' | 'copy' = 'ai'
  let model: string | undefined

  const noteMode = (next: 'ai' | 'machine' | 'copy', nextModel?: string) => {
    if (next === 'copy') mode = 'copy'
    else if (next === 'machine' && mode === 'ai') mode = 'machine'
    model = model || nextModel
  }

  if (stringQueue.length) {
    const result = await translateTextsBatch(stringQueue)
    noteMode(result.mode, result.model)
    for (const item of stringQueue) {
      setPayload[item.key] = result.byKey[item.key] ?? item.value
    }
  }

  if (spanishDetails.length) {
    const detailsQueue = spanishDetails.map((value, i) => ({
      key: `detailsEn[${i}]`,
      value,
    }))
    const result = await translateTextsBatch(detailsQueue)
    noteMode(result.mode, result.model)
    setPayload.detailsEn = detailsQueue.map(
      (item) => result.byKey[item.key] ?? item.value,
    )
  }

  for (const path of blockPaths) {
    const cursor = getAtPath(doc as Record<string, unknown>, path)
    if (!isLocalizedBlocks(cursor) || !cursor.es) continue

    const spanTexts = collectSpanTexts(cursor.es)
    if (!spanTexts.length) {
      setPayload[`${path}.en`] = cursor.es
      continue
    }

    const spanQueue = spanTexts.map((value, i) => ({
      key: `${path}.span[${i}]`,
      value,
    }))
    const result = await translateTextsBatch(spanQueue)
    noteMode(result.mode, result.model)
    const translations = spanQueue.map(
      (item) => result.byKey[item.key] ?? item.value,
    )
    setPayload[`${path}.en`] = applySpanTexts(cursor.es, translations)
  }

  // Always write the draft so Publish can pick up EN fields
  const patchId = targetId.startsWith('drafts.') ? targetId : draftId
  if (!targetId.startsWith('drafts.')) {
    const draftStub = {
      ...(doc as Record<string, unknown>),
      _id: patchId,
    } as {_id: string; _type: string}
    await client.createIfNotExists(draftStub)
  }
  await client
    .patch(patchId)
    .set(setPayload)
    .commit({autoGenerateArrayKeys: true})

  return {
    ok: true,
    mode,
    model,
    message: successMessage(mode, model),
  }
}
