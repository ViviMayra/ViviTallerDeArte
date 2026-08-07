/**
 * Converts legacy heroEyebrow / heroSubline string values to portable text blocks.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-hero-styled-text.mjs
 */
import {createClient} from '@sanity/client'
import {randomBytes} from 'node:crypto'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

function key(prefix) {
  return `${prefix}-${randomBytes(4).toString('hex')}`
}

function stringToBlocks(text) {
  return [
    {
      _type: 'block',
      _key: key('b'),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: key('s'),
          text,
          marks: [],
        },
      ],
    },
  ]
}

function migrateLocalized(value) {
  if (!value || typeof value !== 'object') return {changed: false, value}
  const next = {...value}
  let changed = false

  if (typeof value.es === 'string') {
    const trimmed = value.es.trim()
    if (trimmed) next.es = stringToBlocks(trimmed)
    else delete next.es
    changed = true
  }
  if (typeof value.en === 'string') {
    const trimmed = value.en.trim()
    if (trimmed) next.en = stringToBlocks(trimmed)
    else delete next.en
    changed = true
  }

  return {changed, value: next}
}

async function main() {
  const doc = await client.getDocument('homePage')
  if (!doc) {
    console.error('homePage document not found')
    process.exit(1)
  }

  const patch = {}
  for (const field of ['heroEyebrow', 'heroSubline']) {
    const {changed, value} = migrateLocalized(doc[field])
    if (changed) {
      patch[field] = value
      console.log(`Migrating ${field}…`)
    } else {
      console.log(`${field}: already OK or empty`)
    }
  }

  if (!Object.keys(patch).length) {
    console.log('Nothing to migrate.')
    return
  }

  await client.patch('homePage').set(patch).commit()
  console.log('Done. Refresh Studio — the red errors should be gone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
