import {generateText} from 'ai'

const SYSTEM_PROMPT =
  'You translate Spanish product copy for an art/jewelry atelier into natural English. Return ONLY a JSON array of strings in the same order. Keep proper nouns. Preserve line breaks exactly when present.'

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
  const raw = fenced ? fenced[1].trim() : trimmed
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

async function translateViaGateway(texts: string[]): Promise<TranslateResult> {
  const models = parseModelsEnv(
    process.env.TRANSLATE_MODELS,
    DEFAULT_GATEWAY_MODELS,
  )
  const [primary, ...fallbacks] = models
  if (!primary) throw new Error('No translate models configured')

  const {text, finalStep} = await generateText({
    model: primary,
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
          // Gateway-native backup models (ignored by plain OpenAI)
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
        lastError = new Error(`Translate API failed: ${response.status}`)
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
    errors.push(
      error instanceof Error ? error.message : 'AI Gateway translate failed',
    )
  }

  // 2) Direct OpenAI-compatible chat completions (TRANSLATE_API_KEY / gateway key)
  if (process.env.TRANSLATE_API_KEY || process.env.AI_GATEWAY_API_KEY) {
    try {
      return await translateViaOpenAICompatible(texts)
    } catch (error) {
      errors.push(
        error instanceof Error
          ? error.message
          : 'OpenAI-compatible translate failed',
      )
    }
  }

  // 3) Last resort — copy Spanish so the button never hard-fails for Mayra
  console.warn('[translate] Falling back to Spanish copy:', errors.join(' | '))
  return {translations: texts.map((text) => text), mode: 'copy'}
}
