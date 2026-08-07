import {generateText, gateway} from 'ai'

const SYSTEM_PROMPT =
  'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns. Preserve line breaks exactly when present. Do not wrap the array in markdown.'

/** Primary + backups via Vercel AI Gateway (provider/model slugs). */
const DEFAULT_GATEWAY_MODELS = [
  'openai/gpt-5-mini',
  'google/gemini-2.5-flash',
  'anthropic/claude-haiku-4.5',
]

export type TranslateResult = {
  translations: string[]
  mode: 'ai' | 'copy'
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

/**
 * Translate Spanish strings → English with model failover.
 * Never throws for empty input. On total AI failure, returns a copy fallback
 * so Studio editors still get English fields filled.
 */
export async function translateTexts(texts: string[]): Promise<TranslateResult> {
  if (!texts.length) {
    return {translations: [], mode: 'ai'}
  }

  const errors: string[] = []

  // 1) AI SDK → Vercel AI Gateway (OIDC on Vercel, or AI_GATEWAY_API_KEY locally)
  try {
    return await translateViaGateway(texts)
  } catch (error) {
    errors.push(errorMessage(error))
  }

  // 2) Direct OpenAI-compatible chat completions (TRANSLATE_API_KEY / gateway key)
  if (process.env.TRANSLATE_API_KEY || process.env.AI_GATEWAY_API_KEY) {
    try {
      return await translateViaOpenAICompatible(texts)
    } catch (error) {
      errors.push(errorMessage(error))
    }
  } else {
    errors.push('No AI_GATEWAY_API_KEY / TRANSLATE_API_KEY in env')
  }

  // 3) Last resort — copy Spanish so the button never hard-fails for Mayra
  const fallbackReason = errors.filter(Boolean).join(' | ')
  console.warn('[translate] Falling back to Spanish copy:', fallbackReason)
  return {
    translations: texts.map((text) => text),
    mode: 'copy',
    fallbackReason,
  }
}
