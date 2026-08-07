import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import sharp from 'sharp'
import {getHomePage, getSettings} from '@/lib/content'
import {getImageUrl} from '@/lib/images'
import {urlFor} from '@/sanity/lib/image'
import {blocksToPlainText, getStyledBlocks} from '@/lib/styled-text'
import type {Locale} from '@/lib/types'

export const alt = 'VIVI Taller de Arte'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/** Prefer Sanity CDN crop (respects hotspot) at exact OG dimensions. */
function heroOgUrl(image: Parameters<typeof urlFor>[0] | undefined | null) {
  if (!image) return undefined
  // Local/demo images expose a direct url — skip the CDN builder.
  if (
    typeof image === 'object' &&
    image !== null &&
    'url' in image &&
    typeof (image as {url?: unknown}).url === 'string'
  ) {
    return (image as {url: string}).url
  }
  try {
    return (
      urlFor(image)
        ?.width(size.width)
        .height(size.height)
        .fit('crop')
        .quality(85)
        .url() || undefined
    )
  } catch {
    return undefined
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale: localeParam} = await params
  const locale: Locale = localeParam === 'en' ? 'en' : 'es'

  const [home, settings] = await Promise.all([getHomePage(), getSettings()])

  const heroUrl =
    heroOgUrl(home.heroImage) ||
    getImageUrl(home.heroImage, 1600, {
      autoFormat: false,
      quality: 85,
    })
  const logoUrl = getImageUrl(settings.logo, 1000, {
    fit: 'max',
    autoFormat: false,
  })

  const [heroBuf, logoRemote] = await Promise.all([
    heroUrl ? fetchBuffer(heroUrl) : Promise.resolve(null),
    logoUrl ? fetchBuffer(logoUrl) : Promise.resolve(null),
  ])

  let logoBuf = logoRemote
  if (!logoBuf) {
    try {
      logoBuf = await readFile(join(process.cwd(), 'public/logo.png'))
    } catch {
      logoBuf = null
    }
  }

  const eyebrow = blocksToPlainText(
    getStyledBlocks(
      home.heroEyebrow,
      locale,
      locale === 'es' ? 'Taller de Arte' : 'Art Workshop',
    ),
  )
  const subline = blocksToPlainText(getStyledBlocks(home.heroSubline, locale))

  // Normalize every layer to PNG first — more reliable under Next's bundler.
  const basePng = heroBuf
    ? await sharp(heroBuf)
        .resize(size.width, size.height, {fit: 'cover', position: 'centre'})
        .png()
        .toBuffer()
    : await sharp({
        create: {
          width: size.width,
          height: size.height,
          channels: 3,
          background: '#f7f4ef',
        },
      })
        .png()
        .toBuffer()

  const washPng = await sharp(
    Buffer.from(`
      <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white" stop-opacity="0.42"/>
            <stop offset="38%" stop-color="white" stop-opacity="0"/>
            <stop offset="68%" stop-color="white" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="white" stop-opacity="0.8"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
    `),
  )
    .png()
    .toBuffer()

  const composites: sharp.OverlayOptions[] = [
    {input: washPng, top: 0, left: 0},
  ]

  if (logoBuf) {
    const logoPng = await sharp(logoBuf)
      .resize(320, 216, {fit: 'inside', withoutEnlargement: true})
      .png()
      .toBuffer()
    composites.push({input: logoPng, top: 36, left: 44})
  }

  // Match the site hero: brand + uppercase eyebrow/subline, no nav.
  const titleLines = [
    `<text x="48" y="470" font-family="Helvetica, Arial, sans-serif" font-size="72" letter-spacing="12" fill="#111111">VIVI</text>`,
    eyebrow
      ? `<text x="48" y="520" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="5" fill="#1a1a1a">${escapeXml(eyebrow.toUpperCase())}</text>`
      : '',
    subline
      ? `<text x="48" y="558" font-family="Helvetica, Arial, sans-serif" font-size="18" letter-spacing="3" fill="#2a2a2a">${escapeXml(subline.toUpperCase())}</text>`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const titlesPng = await sharp(
    Buffer.from(`
      <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
        ${titleLines}
      </svg>
    `),
  )
    .png()
    .toBuffer()
  composites.push({input: titlesPng, top: 0, left: 0})

  const png = await sharp(basePng).composite(composites).png().toBuffer()

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
