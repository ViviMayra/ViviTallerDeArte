import {generateText, gateway} from 'ai'
import {createGoogleGenerativeAI} from '@ai-sdk/google'

const SYSTEM_PROMPT =
  'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns. Preserve line breaks exactly when present. Do not wrap the array in markdown.'

/**
 * Free Gemini models via Google AI Studio.
 * Tried in order — if one is closed to new keys / rate-limited / retired, the next runs.
 * Prefer Gemini 3.x aliases; keep “latest” aliases as soft landing pads.
 */
const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
]

/** Optional credit backups via Vercel AI Gateway. */
const DEFAULT_GATEWAY_MODELS = [
  'google/gemini-3.5-flash',
  'google/gemini-3.1-flash-lite',
  'openai/gpt-5-mini',
]

export type TranslateResult = {
  translations: string[]
  mode: 'ai' | 'machine' | 'copy'
  model?: string
  /** Present when we had to fall back — safe to show in Studio toasts. */
  fallbackReason?: string
}

function parseModelsEnv(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) return fallback
  return value
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)
}

function parseJsonArray(content: string, expectedLength: number): string[] {
  const trimmed = content.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  let raw = fenced ? fenced[1].trim() : trimmed

  // Models sometimes add prose around the array — pull the first JSON array
  if (!raw.startsWith('[')) {
    const start = raw.indexOf('[')
    const end = raw.lastIndexOf(']')
    if (start >= 0 && end > start) raw = raw.slice(start, end + 1)
  }

  const parsed = JSON.parse(raw) as unknown
  if (!Array.isArray(parsed) || parsed.length !== expectedLength) {
    throw new Error('Unexpected translate response shape')
  }
  if (!parsed.every((item) => typeof item === 'string')) {
    throw new Error('Translate response contained non-strings')
  }
  return parsed
}

function stripProvider(model: string): string {
  const slash = model.indexOf('/')
  return slash >= 0 ? model.slice(slash + 1) : model
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

/**
 * Normalize Google AI Studio / Gemini keys.
 * Accepts legacy `AIza…` keys and newer `AQ.…` keys; strips quotes / Bearer / whitespace.
 * Never reject based on prefix — Google has changed formats before.
 */
export function normalizeGeminiApiKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  let key = raw.trim()
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim()
  }
  if (/^bearer\s+/i.test(key)) {
    key = key.replace(/^bearer\s+/i, '').trim()
  }
  // Common paste mistake: trailing newline or zero-width chars
  key = key.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
  return key || undefined
}

function geminiApiKey(): string | undefined {
  return normalizeGeminiApiKey(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
  )
}

function geminiModels(): string[] {
  return parseModelsEnv(
    process.env.TRANSLATE_GEMINI_MODELS,
    DEFAULT_GEMINI_MODELS,
  )
}

/**
 * Direct Google Generative Language REST call.
 * Most reliable with newer `AQ.` Studio keys — no SDK prefix assumptions.
 */
async function translateViaGeminiRest(
  texts: string[],
): Promise<TranslateResult> {
  const apiKey = geminiApiKey()
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const models = geminiModels()
  let lastError: Error | null = null

  for (const model of models) {
    try {
      const url = new URL(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      )
      url.searchParams.set('key', apiKey)

      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          systemInstruction: {parts: [{text: SYSTEM_PROMPT}]},
          contents: [{role: 'user', parts: [{text: JSON.stringify(texts)}]}],
          generationConfig: {temperature: 0.2},
        }),
      })

      const bodyText = await response.text()
      if (!response.ok) {
        lastError = new Error(
          `Gemini REST ${model} ${response.status}: ${bodyText.slice(0, 220)}`,
        )
        console.warn(`[translate] ${lastError.message}`)
        continue
      }

      const json = JSON.parse(bodyText) as {
        candidates?: {content?: {parts?: {text?: string}[]}}[]
      }
      const text =
        json.candidates
          ?.flatMap((c) => c.content?.parts || [])
          .map((p) => p.text || '')
          .join('') || ''

      if (!text.trim()) {
        lastError = new Error(`Gemini REST ${model} returned empty text`)
        continue
      }

      return {
        translations: parseJsonArray(text, texts.length),
        mode: 'ai',
        model: `google/${model}`,
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(`Gemini REST ${model} failed`)
      console.warn(
        `[translate] Gemini REST failed (${model}):`,
        errorMessage(error),
      )
    }
  }

  throw lastError || new Error('All Gemini REST models failed')
}

/** AI SDK Google provider — second Gemini path if REST somehow fails. */
async function translateViaGeminiSdk(texts: string[]): Promise<TranslateResult> {
  const apiKey = geminiApiKey()
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const google = createGoogleGenerativeAI({apiKey})
  const models = geminiModels()
  let lastError: Error | null = null

  for (const model of models) {
    try {
      const {text} = await generateText({
        model: google(model),
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        prompt: JSON.stringify(texts),
      })

      return {
        translations: parseJsonArray(text, texts.length),
        mode: 'ai',
        model: `google/${model}`,
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error(`Gemini SDK ${model} failed`)
      console.warn(
        `[translate] Gemini SDK model failed (${model}):`,
        errorMessage(error),
      )
    }
  }

  throw lastError || new Error('All Gemini SDK models failed')
}

async function translateViaGateway(texts: string[]): Promise<TranslateResult> {
  const models = parseModelsEnv(
    process.env.TRANSLATE_MODELS,
    DEFAULT_GATEWAY_MODELS,
  )
  const [primary, ...fallbacks] = models
  if (!primary) throw new Error('No translate models configured')

  const {text, finalStep} = await generateText({
    model: gateway(primary),
    temperature: 0.2,
    providerOptions: {
      gateway: {
        models: fallbacks,
      },
    },
    system: SYSTEM_PROMPT,
    prompt: JSON.stringify(texts),
  })

  const usedModel =
    (finalStep as {modelId?: string} | undefined)?.modelId || primary

  return {
    translations: parseJsonArray(text, texts.length),
    mode: 'ai',
    model: usedModel,
  }
}

async function translateViaOpenAICompatible(
  texts: string[],
): Promise<TranslateResult> {
  const apiKey = process.env.TRANSLATE_API_KEY || process.env.AI_GATEWAY_API_KEY
  if (!apiKey) {
    throw new Error('Missing TRANSLATE_API_KEY / AI_GATEWAY_API_KEY')
  }

  const url =
    process.env.TRANSLATE_API_URL ||
    'https://ai-gateway.vercel.sh/v1/chat/completions'

  const usesGateway = url.includes('ai-gateway.vercel.sh')
  const models = parseModelsEnv(
    process.env.TRANSLATE_MODELS,
    usesGateway
      ? DEFAULT_GATEWAY_MODELS
      : DEFAULT_GATEWAY_MODELS.map(stripProvider),
  )

  let lastError: Error | null = null

  for (const model of models) {
    try {
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
            {role: 'system', content: SYSTEM_PROMPT},
            {role: 'user', content: JSON.stringify(texts)},
          ],
          ...(usesGateway
            ? {
                providerOptions: {
                  gateway: {
                    models: models.filter((m) => m !== model),
                  },
                },
              }
            : {}),
        }),
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        lastError = new Error(
          `Translate API ${response.status}${body ? `: ${body.slice(0, 180)}` : ''}`,
        )
        continue
      }

      const json = (await response.json()) as {
        model?: string
        choices?: {message?: {content?: string}}[]
      }
      const content = json.choices?.[0]?.message?.content || '[]'
      return {
        translations: parseJsonArray(content, texts.length),
        mode: 'ai',
        model: json.model || model,
      }
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error('Translate request failed')
    }
  }

  throw lastError || new Error('All translate models failed')
}

async function translateViaMyMemory(texts: string[]): Promise<TranslateResult> {
  const translations: string[] = []

  for (const text of texts) {
    const chunk = text.length > 450 ? text.slice(0, 450) : text
    const url = new URL('https://api.mymemory.translated.net/get')
    url.searchParams.set('q', chunk)
    url.searchParams.set('langpair', 'es|en')

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`MyMemory failed: ${response.status}`)
    }

    const json = (await response.json()) as {
      responseStatus?: number | string
      responseData?: {translatedText?: string}
      quotaFinished?: boolean
    }

    if (json.quotaFinished) {
      throw new Error('MyMemory quota finished')
    }

    const status = Number(json.responseStatus)
    const translated = json.responseData?.translatedText
    if (status !== 200 || typeof translated !== 'string' || !translated.trim()) {
      throw new Error('MyMemory returned empty translation')
    }

    translations.push(translated)
  }

  return {
    translations,
    mode: 'machine',
    model: 'mymemory',
  }
}

/**
 * Translate Spanish → English with layered failover.
 * Never throws for empty input. On total failure, copies Spanish (button still “works”).
 *
 * Order:
 * 1. Gemini REST (best for new AQ. keys) — try each model
 * 2. Gemini AI SDK — try each model again
 * 3. Vercel AI Gateway
 * 4. OpenAI-compatible gateway URL (if keyed)
 * 5. MyMemory
 * 6. Copy Spanish
 */
export async function translateTexts(texts: string[]): Promise<TranslateResult> {
  if (!texts.length) {
    return {translations: [], mode: 'ai'}
  }

  const errors: string[] = []
  const key = geminiApiKey()

  if (key) {
    try {
      return await translateViaGeminiRest(texts)
    } catch (error) {
      errors.push(`rest: ${errorMessage(error)}`)
    }

    try {
      return await translateViaGeminiSdk(texts)
    } catch (error) {
      errors.push(`sdk: ${errorMessage(error)}`)
    }
  } else {
    errors.push('No GOOGLE_GENERATIVE_AI_API_KEY in env')
  }

  try {
    return await translateViaGateway(texts)
  } catch (error) {
    errors.push(`gateway: ${errorMessage(error)}`)
  }

  if (process.env.TRANSLATE_API_KEY || process.env.AI_GATEWAY_API_KEY) {
    try {
      return await translateViaOpenAICompatible(texts)
    } catch (error) {
      errors.push(`openai-compat: ${errorMessage(error)}`)
    }
  }

  try {
    return await translateViaMyMemory(texts)
  } catch (error) {
    errors.push(`mymemory: ${errorMessage(error)}`)
  }

  const fallbackReason = errors.filter(Boolean).join(' | ')
  console.warn('[translate] Falling back to Spanish copy:', fallbackReason)
  return {
    translations: texts.map((text) => text),
    mode: 'copy',
    fallbackReason,
  }
}
