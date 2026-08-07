/** Normalize Instagram handle or URL to a full profile URL. */
export function instagramUrl(value?: string) {
  if (!value) return 'https://www.instagram.com/vivitallerdearte/'
  if (value.startsWith('http')) return value
  return `https://www.instagram.com/${value.replace(/^@/, '')}/`
}

/** Prefer a full URL; otherwise treat as a page id / username. */
export function facebookUrl(value?: string) {
  if (!value) return 'https://www.facebook.com/share/1DBKaYYyse/'
  if (value.startsWith('http')) return value
  return `https://www.facebook.com/${value.replace(/^@/, '')}`
}

/** Prefer a full URL; otherwise treat as a @handle. */
export function tiktokUrl(value?: string) {
  if (!value) return 'https://www.tiktok.com/@viviartistryimagination'
  if (value.startsWith('http')) {
    try {
      const url = new URL(value)
      url.search = ''
      url.hash = ''
      return url.toString().replace(/\/$/, '')
    } catch {
      return value
    }
  }
  const handle = value.replace(/^@/, '')
  return `https://www.tiktok.com/@${handle}`
}
