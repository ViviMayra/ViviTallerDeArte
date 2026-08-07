/**
 * Canonical public site URL for metadata, sitemap, and JSON-LD.
 * Never emit localhost in production builds — Instagram/Facebook can't fetch it.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured && !isLocalhost(configured)) {
    return stripTrailingSlash(configured)
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (productionHost) {
    return `https://${productionHost.replace(/^https?:\/\//, '')}`
  }

  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) {
    return `https://${vercelHost.replace(/^https?:\/\//, '')}`
  }

  return configured ? stripTrailingSlash(configured) : 'http://localhost:3000'
}

function isLocalhost(url: string) {
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.startsWith('http://0.0.0.0')
  )
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, '')
}
