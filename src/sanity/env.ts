export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Public project id — keep a real default so Studio never boots as "placeholder"
// if NEXT_PUBLIC_* is missing from a Vercel build.
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '25hzbdf6'

export const hasSanityConfig = Boolean(projectId)
