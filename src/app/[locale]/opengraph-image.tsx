import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {ImageResponse} from 'next/og'
import sharp from 'sharp'
import {getHomePage, getSettings} from '@/lib/content'
import {getImageUrl} from '@/lib/images'
import {urlFor} from '@/sanity/lib/image'
import {blocksToPlainText, getStyledBlocks} from '@/lib/styled-text'
import type {Locale, SanityImage} from '@/lib/types'

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

/** Prefer Sanity CDN crop (respects hotspot) at exact OG dimensions. */
function heroOgUrl(image?: SanityImage | null) {
  if (!image) return undefined
  if (image.url) return image.url
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

  const [home, settings, syneFont, figtreeFont] = await Promise.all([
    getHomePage(),
    getSettings(),
    readFile(join(process.cwd(), 'public/fonts/Syne-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/Figtree-Regular.ttf')),
  ])

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
            <stop offset="0%" stop-color="rgb(247,244,239)" stop-opacity="0.42"/>
            <stop offset="38%" stop-color="rgb(247,244,239)" stop-opacity="0"/>
            <stop offset="68%" stop-color="rgb(247,244,239)" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="rgb(247,244,239)" stop-opacity="0.8"/>
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
      .resize(340, 120, {fit: 'inside', withoutEnlargement: true})
      .png()
      .toBuffer()
    composites.push({input: logoPng, top: 32, left: 40})
  }

  // Render titles with next/og fonts (system SVG fonts failed on Vercel → □□□□).
  const titlesResponse = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: 'transparent',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 48,
            bottom: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              fontFamily: 'Syne',
              fontSize: 72,
              letterSpacing: 12,
              color: '#111111',
              lineHeight: 1,
            }}
          >
            VIVI
          </div>
          {eyebrow ? (
            <div
              style={{
                marginTop: 16,
                fontFamily: 'Figtree',
                fontSize: 24,
                letterSpacing: 4,
                color: '#1a1a1a',
                lineHeight: 1.15,
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          {subline ? (
            <div
              style={{
                marginTop: 10,
                fontFamily: 'Figtree',
                fontSize: 17,
                letterSpacing: 3,
                color: '#2a2a2a',
                lineHeight: 1.15,
                textTransform: 'uppercase',
              }}
            >
              {subline}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {name: 'Syne', data: syneFont, style: 'normal', weight: 400},
        {name: 'Figtree', data: figtreeFont, style: 'normal', weight: 400},
      ],
    },
  )
  const titlesPng = Buffer.from(await titlesResponse.arrayBuffer())
  composites.push({input: titlesPng, top: 0, left: 0})

  const png = await sharp(basePng).composite(composites).png().toBuffer()

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
