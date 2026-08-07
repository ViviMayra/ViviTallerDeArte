/**
 * Seeds the Sanity homePage document with current placeholder content.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=sk... node scripts/seed-home.mjs
 *
 * Create a token with Editor permissions at:
 *   https://www.sanity.io/manage → Project → API → Tokens
 */

import {createClient} from '@sanity/client'
import {createReadStream} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

if (!projectId || projectId === 'placeholder') {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  process.exit(1)
}
if (!token) {
  console.error(
    'Missing SANITY_API_WRITE_TOKEN.\nCreate one (Editor) at https://www.sanity.io/manage and run:\n  SANITY_API_WRITE_TOKEN=sk... node scripts/seed-home.mjs',
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

const tmpDir = path.join(root, '.tmp-seed')

async function download(url, filename) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const filePath = path.join(tmpDir, filename)
  await writeFile(filePath, buf)
  return filePath
}

async function uploadImage(filePath, filename) {
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename,
  })
  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
  }
}

function withAlt(image, alt) {
  return {...image, alt}
}

async function main() {
  await mkdir(tmpDir, {recursive: true})

  console.log('Downloading placeholder images…')
  const files = {
    hero: await download(
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=2400&q=80',
      'hero.jpg',
    ),
    jewelry: await download(
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
      'jewelry.jpg',
    ),
    ceramics: await download(
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80',
      'ceramics.jpg',
    ),
    illustration: await download(
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&q=80',
      'illustration.jpg',
    ),
    painting: await download(
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&q=80',
      'painting.jpg',
    ),
    exhibition: await download(
      'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1600&q=80',
      'exhibition.jpg',
    ),
    workshop: await download(
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=80',
      'workshop.jpg',
    ),
  }

  console.log('Uploading to Sanity…')
  const heroImage = withAlt(await uploadImage(files.hero, 'hero.jpg'), {
    es: 'VIVI Taller de Arte',
    en: 'VIVI Art Workshop',
  })
  const jewelryImage = withAlt(await uploadImage(files.jewelry, 'jewelry.jpg'), {
    es: 'Joyería artesanal',
    en: 'Artisan jewelry',
  })
  const ceramicsImage = withAlt(
    await uploadImage(files.ceramics, 'ceramics.jpg'),
    {es: 'Cerámica hecha a mano', en: 'Handmade ceramics'},
  )
  const illustrationImage = withAlt(
    await uploadImage(files.illustration, 'illustration.jpg'),
    {es: 'Ilustración y arte', en: 'Illustration and art'},
  )
  const paintingImage = withAlt(
    await uploadImage(files.painting, 'painting.jpg'),
    {es: 'Pintura', en: 'Painting'},
  )
  const exhibitionImage = withAlt(
    await uploadImage(files.exhibition, 'exhibition.jpg'),
    {es: 'Exhibiciones', en: 'Exhibitions'},
  )
  const workshopImage = withAlt(
    await uploadImage(files.workshop, 'workshop.jpg'),
    {es: 'Taller creativo', en: 'Creative workshop'},
  )

  const doc = {
    _id: 'homePage',
    _type: 'homePage',
    heroImage,
    heroEyebrow: {
      es: 'Taller de Arte',
      en: 'Art Workshop',
    },
    featuredCarouselTitle: {
      es: 'Destacados',
      en: 'Featured',
    },
    featuredCarousel: [
      {
        _key: 'photo-jewelry',
        _type: 'photoSlide',
        image: jewelryImage,
      },
      {
        _key: 'photo-ceramics',
        _type: 'photoSlide',
        image: ceramicsImage,
      },
      {
        _key: 'photo-illustration',
        _type: 'photoSlide',
        image: illustrationImage,
      },
      {
        _key: 'photo-painting',
        _type: 'photoSlide',
        image: paintingImage,
      },
      {
        _key: 'photo-workshop',
        _type: 'photoSlide',
        image: workshopImage,
      },
    ],
    sections: [
      {
        _key: 'section-joyeria',
        _type: 'homeSection',
        title: {es: 'Joyería', en: 'Jewelry'},
        text: {
          es: 'Piezas hechas a mano en plata y materiales naturales.',
          en: 'Handmade pieces in silver and natural materials.',
        },
        image: withAlt(jewelryImage, {es: 'Joyería', en: 'Jewelry'}),
        link: 'joyeria',
      },
      {
        _key: 'section-ceramica',
        _type: 'homeSection',
        title: {es: 'Cerámica', en: 'Ceramics'},
        text: {
          es: 'Formas únicas para el hogar y el ritual cotidiano.',
          en: 'Unique forms for the home and everyday ritual.',
        },
        image: withAlt(ceramicsImage, {es: 'Cerámica', en: 'Ceramics'}),
        link: 'ceramica',
      },
      {
        _key: 'section-ilustraciones',
        _type: 'homeSection',
        title: {es: 'Ilustraciones', en: 'Illustrations'},
        text: {
          es: 'Dibujos e ilustraciones con identidad propia.',
          en: 'Drawings and illustrations with their own voice.',
        },
        image: withAlt(illustrationImage, {
          es: 'Ilustraciones',
          en: 'Illustrations',
        }),
        link: 'ilustraciones',
      },
      {
        _key: 'section-pintura',
        _type: 'homeSection',
        title: {es: 'Pintura', en: 'Painting'},
        text: {
          es: 'Obras pictóricas disponibles para consulta.',
          en: 'Paintings available for inquiry.',
        },
        image: withAlt(paintingImage, {es: 'Pintura', en: 'Painting'}),
        link: 'pintura',
      },
      {
        _key: 'section-exhibiciones',
        _type: 'homeSection',
        title: {es: 'Exhibiciones', en: 'Exhibitions'},
        text: {
          es: 'Concursos y muestras en las que ha participado VIVI.',
          en: 'Contests and shows VIVI has taken part in.',
        },
        image: withAlt(exhibitionImage, {
          es: 'Exhibiciones',
          en: 'Exhibitions',
        }),
        link: 'exhibiciones',
      },
    ],
    seo: {
      title: 'VIVI Taller de Arte | Joyería y arte en Perú',
      description:
        'Joyería artesanal, cerámica, ilustración y pintura. Piezas únicas hechas en Perú.',
    },
  }

  console.log('Writing homePage document…')
  await client.createOrReplace(doc)
  console.log('Done. Open Studio → Inicio, then Publish if needed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
