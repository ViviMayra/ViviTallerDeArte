import {generateText, gateway} from 'ai'
import {createGoogleGenerativeAI} from '@ai-sdk/google'

const SYSTEM_PROMPT =
  'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns. Preserve line breaks exactly when present. Do not wrap the array in markdown.'

/**
 * Free Gemini models via Google AI Studio (GOOGLE_GENERATIVE_AI_API_KEY).
 * Tried in order when the previous model errors / is rate-limited.
 * Prefer Gemini 3.x — 2.5 Flash is closed to many new free-tier keys.
 */
const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
]

/** Optional paid/credit backups via Vercel AI Gateway. */
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

function geminiApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    undefined
  )
}

async function translateViaGemini(texts: string[]): Promise<TranslateResult> {
  const apiKey = geminiApiKey()
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const google = createGoogleGenerativeAI({apiKey})
  const models = parseModelsEnv(
    process.env.TRANSLATE_GEMINI_MODELS,
    DEFAULT_GEMINI_MODELS,
  )

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
        error instanceof Error ? error : new Error(`Gemini ${model} failed`)
      console.warn(`[translate] Gemini model failed (${model}):`, errorMessage(error))
    }
  }

  throw lastError || new Error('All Gemini models failed')
}

async function translateViaGateway(texts: string[]): Promise<TranslateResult> {
  const models = parseModelsEnv(
    process.env.TRANSLATE_MODELS,
    DEFAULT_GATEWAY_MODELS,
  )
  const [primary, ...fallbacks] = models
  if (!primary) throw new Error('No translate models configured')

  // gateway() wrapper is required for providerOptions.gateway model failover
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
    // Keep requests short — MyMemory URL length limits
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
 * Translate Spanish strings → English with model failover.
 * Never throws for empty input. On total AI failure, returns a copy fallback
 * so Studio editors still get English fields filled.
 *
 * Order: Gemini (free) → AI Gateway → MyMemory → copy Spanish.
 */
export async function translateTexts(texts: string[]): Promise<TranslateResult> {
  if (!texts.length) {
    return {translations: [], mode: 'ai'}
  }

  const errors: string[] = []

  // 1) Free Gemini via Google AI Studio key (primary + Gemini model backups)
  if (geminiApiKey()) {
    try {
      return await translateViaGemini(texts)
    } catch (error) {
      errors.push(errorMessage(error))
    }
  } else {
    errors.push('No GOOGLE_GENERATIVE_AI_API_KEY in env')
  }

  // 2) AI SDK → Vercel AI Gateway (OIDC on Vercel, or AI_GATEWAY_API_KEY locally)
  try {
    return await translateViaGateway(texts)
  } catch (error) {
    errors.push(errorMessage(error))
  }

  // 3) Direct OpenAI-compatible chat completions (TRANSLATE_API_KEY / gateway key)
  if (process.env.TRANSLATE_API_KEY || process.env.AI_GATEWAY_API_KEY) {
    try {
      return await translateViaOpenAICompatible(texts)
    } catch (error) {
      errors.push(errorMessage(error))
    }
  }

  // 4) Free machine translation so Studio still gets real English without AI keys
  try {
    return await translateViaMyMemory(texts)
  } catch (error) {
    errors.push(errorMessage(error))
  }

  // 5) Last resort — copy Spanish so the button never hard-fails for Mayra
  const fallbackReason = errors.filter(Boolean).join(' | ')
  console.warn('[translate] Falling back to Spanish copy:', fallbackReason)
  return {
    translations: texts.map((text) => text),
    mode: 'copy',
    fallbackReason,
  }
}
