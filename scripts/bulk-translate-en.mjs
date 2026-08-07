/**
 * One-shot: fill English fields for all Spanish CMS content currently in Sanity.
 *
 * Usage:
 *   set -a && source .env.local && set +a && node scripts/bulk-translate-en.mjs
 *
 * Requires SANITY_API_WRITE_TOKEN (Editor). Writes published docs directly;
 * also updates matching drafts when present.
 */
import {createClient} from '@sanity/client'

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

/** Exact Spanish → English for current catalog (normalize before lookup). */
const EXACT = {
  // Titles
  'ANILLO CURVADO': 'CURVED RING',
  'Esfera azul Floral': 'Blue Floral Sphere',
  'Portada de la colección': 'Collection cover',
  'Disco de llaves': 'Key disc',
  'Braylen Prueba': 'Braylen Test',
  'Disco de Cornucopia y Maíces': 'Cornucopia and Corn Disc',
  'ANILLO CHEVALIER': 'CHEVALIER RING',
  'Triada multicolor II': 'Multicolor Triad II',
  'HUEVOS CÓSMICOS': 'COSMIC EGGS',
  'Esfera decorativa amarilla': 'Yellow decorative sphere',
  'CORTEZA DE MOLLE': 'MOLLE BARK',
  'ORQUIDEA BLANCA': 'WHITE ORCHID',
  'Capullos multicolor': 'Multicolor buds',
  'Anillo Lavanda': 'Lavender Ring',
  'Capullo multicolor II': 'Multicolor bud II',
  'SEMILLAS CACAO': 'CACAO SEEDS',
  'FLOR DE PANTY': 'PANSY FLOWER',
  'Esfera  decorativa roja': 'Red decorative sphere',
  'Esfera decorativa roja': 'Red decorative sphere',
  'Esfera Navideña': 'Christmas Sphere',
  'ANILLO ESPEJO DE AGUA': 'WATER MIRROR RING',
  'Triada multicolor I': 'Multicolor Triad I',

  // Piece types
  ANILLOS: 'RINGS',
  DECORATIVO: 'DECORATIVE',
  ARETES: 'EARRINGS',
  Collares: 'Necklaces',
  'COLECCIÓN DONDE UN MITO SE ENCUENTRA': 'WHERE A MYTH IS FOUND COLLECTION',

  // Alts / misc
  'una prueba. Braylen': 'A test. Braylen',
  'Braylen Universidad': 'Braylen University',
  'una Prueba De Braylen': 'A Braylen test',
  'Creado por Mayra Cortez': 'Created by Mayra Cortez',

  // Short details
  'Plata de ley 950': 'Sterling silver 950',
  'Plata 950': 'Silver 950',
  'A pedido': 'Made to order',
  Impresión: 'Print',
  Portada: 'Cover',
  '1 en stock': '1 in stock',
  Hombre: 'Men',
  'Español y ingles': 'Spanish and English',
  'Venta en colección': 'Sold as a collection',
  'Opción de impresión en web': 'Print option available online',
  'Acrílico sobre lienzo y aplicación de pan de bronce':
    'Acrylic on canvas with bronze leaf application',
  '999 y 950': '999 and 950',
  '999 / 950': '999 / 950',
}

const DESCRIPTIONS = {
  'Colección AUQUI \nAnillo curvado con acabado de espejo.\n\nTalla: 23\nMedidas: Ancho 6mm.':
    'AUQUI Collection\nCurved ring with a mirror finish.\n\nSize: 23\nMeasurements: Width 6mm.',

  'Esfera en cerámica vidriada, modelada y pintada artesanalmente.':
    'Glazed ceramic sphere, hand-modeled and hand-painted.',

  'Donde un Mito se Encuentra", es una colección pictórica inspirada en la mitología y cosmovisión del pueblo amazónico Wachiperi. Nos relata el origen del hombre en una serie de hechos que ilustran cada etapa de su conexión con su esencia y el despertar de la conciencia.':
    '"Where a Myth Is Found" is a painting collection inspired by the mythology and worldview of the Amazonian Wachiperi people. It tells the origin of humankind through a series of moments that illustrate each stage of connection with one\'s essence and the awakening of consciousness.',

  'Trio de discos colgantes en cerámica vidriada, modelada y pintada artesanalmente.':
    'Trio of hanging discs in glazed ceramic, hand-modeled and hand-painted.',

  'Disco de cornucopia en cerámica vidriada, modelada y pintada artesanalmente.':
    'Cornucopia disc in glazed ceramic, hand-modeled and hand-painted.',

  'Colección AUQUI\nAnillo chevalier delgado. \nMaterial: Plata Peruana de Ley 950. \nTalla: 21\nMedidas: Ancho 5 mm.':
    'AUQUI Collection\nSlim chevalier ring.\nMaterial: Peruvian sterling silver 950.\nSize: 21\nMeasurements: Width 5 mm.',

  'Colección Jardines de las delicias. \nAretes tejidos con hilo de plata y piedras naturales.\nLepidolita / jade amarillo':
    'Gardens of Delights Collection.\nEarrings woven with silver thread and natural stones.\nLepidolite / yellow jade',

  'En el proceso formativo de la Tierra, el CHININI (Universo) depositó su energía en dos huevos para la creación de la humanidad. Un huevo simboliza la energía masculina y el otro la energía femenina, ambos representando el equilibrio. Los huevos simbolizan el origen, el inicio, el vientre que fecunda con amor a la humanidad.\nSegún el mito, el huevo masculino es picado por un ave y se rompe primero, de esta manera equilibrando ambas energías en la tierra, lo que se considerará como la primera generación.':
    'In the formative process of the Earth, CHININI (the Universe) placed its energy in two eggs for the creation of humanity. One egg symbolizes masculine energy and the other feminine energy, both representing balance. The eggs symbolize origin, beginning—the womb that lovingly brings humanity into being.\nAccording to the myth, the masculine egg is pecked by a bird and breaks first, thus balancing both energies on earth, considered the first generation.',

  'Colección XVI\nEsfera en cerámica vidriada, modelada y pintada artesanalmente.':
    'Collection XVI\nGlazed ceramic sphere, hand-modeled and hand-painted.',

  'Anillo de banda ancha texturizado como la corteza del arbol de molle.\nMaterial: Plata Peruana de Ley 950. \nTalla: 23-24\nMedidas: Ancho 14 mm.':
    'Wide-band ring textured like the bark of the molle tree.\nMaterial: Peruvian sterling silver 950.\nSize: 23-24\nMeasurements: Width 14 mm.',

  'Colección: Jardines del Bosque\nOrquídeas tejidas con hilo de plata ley 999 y asas en plata maciza 950 con aplicación de perlas naturales.':
    'Collection: Forest Gardens\nOrchids woven with 999 silver thread and solid 950 silver hooks with natural pearl accents.',

  'Colección Jardines de las delicias\nCapullos tejidos con hilo de plata Ley 999 y aplicación de cristales y perla natural con adad de plata Ley 950':
    'Gardens of Delights Collection\nBuds woven with 999 silver thread, with crystals and a natural pearl, and 950 silver hooks',

  'Colección Jardines de las delicias\nCapullos tejidos con hilo de plata Ley 999 y aplicación de cristales y perla natural con asas de plata Ley 950':
    'Gardens of Delights Collection\nBuds woven with 999 silver thread, with crystals and a natural pearl, and 950 silver hooks',

  'Anillo en plata 950 con incrustación de zircon.\nTalla: 18 PE':
    '950 silver ring with cubic zirconia inlay.\nSize: 18 PE',

  'Colección Jardines de las delicias \nCapullos tejidos con hilo de plata Ley 999 y aplicación de cristales, piedra natural con asas de plata Ley 950':
    'Gardens of Delights Collection\nBuds woven with 999 silver thread, with crystals and natural stone, and 950 silver hooks',

  'Colección: Jardines del Bosque\nDescripción: Gotas de chistal austriaco tejias con hilo de plata de Ley 999 y asas en plata 950.':
    'Collection: Forest Gardens\nDescription: Austrian crystal drops woven with 999 silver thread and 950 silver hooks.',

  'Colección: Jardines del Bosque\nDescripción: Flores tejidas con hilo de plata Ley 99 y asas en plata meciza 950 con aplicación de cristales.':
    'Collection: Forest Gardens\nDescription: Flowers woven with silver thread and solid 950 silver hooks with crystal accents.',

  'Colección XVI\nEsfera en cerámica vidriada, modelada y pintada artesanalmente.\nDimensiones: 6.5cm x 6.5cm':
    'Collection XVI\nGlazed ceramic sphere, hand-modeled and hand-painted.\nDimensions: 6.5cm x 6.5cm',

  'Colección: AUQUI \nAnillo clásico de banda ancha con acabado de espejo.\nMaterial: Plata de ley 950\nTalla: 25\nMedidas: Ancho 10mm':
    'Collection: AUQUI\nClassic wide-band ring with a mirror finish.\nMaterial: Sterling silver 950\nSize: 25\nMeasurements: Width 10mm',
}

function normalize(text) {
  return String(text).replace(/\s+$/g, '').trim()
}

function translateLine(text) {
  const raw = String(text)
  const key = normalize(raw)
  if (!key) return raw

  if (DESCRIPTIONS[key]) return DESCRIPTIONS[key]
  if (EXACT[key]) return EXACT[key]

  // Details like "Talla: 23" / "Medidas: Ancho 6mm."
  let out = key
  out = out
    .replace(/^Talla:\s*/i, 'Size: ')
    .replace(/^Medidas:\s*/i, 'Measurements: ')
    .replace(/\bAncho\b/gi, 'Width')
    .replace(/\bDimensiones:\s*/i, 'Dimensions: ')
    .replace(/\bPlata Peruana de Ley\b/gi, 'Peruvian sterling silver')
    .replace(/\bPlata de ley\b/gi, 'Sterling silver')
    .replace(/\bplata maciza\b/gi, 'solid silver')
    .replace(/\bplata meciza\b/gi, 'solid silver')
    .replace(/\bhilo de plata\b/gi, 'silver thread')
    .replace(/\bAretes\b/g, 'Earrings')
    .replace(/\bAnillo\b/g, 'Ring')
    .replace(/\bColección\b/g, 'Collection')
    .replace(/\ben stock\b/gi, 'in stock')
    .replace(/\bA pedido\b/gi, 'Made to order')

  if (out !== key) return out

  console.warn('  ! No translation for:', JSON.stringify(key).slice(0, 120))
  return key
}

function isLocalizedFieldKeys(keys) {
  return keys.every((k) => k === 'es' || k === 'en' || k === '_type' || k === '_key')
}

function isLocalizedString(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.es === 'string' &&
    isLocalizedFieldKeys(Object.keys(value)) &&
    (value.en === undefined || typeof value.en === 'string')
  )
}

function isLocalizedBlocks(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Array.isArray(value.es) &&
    isLocalizedFieldKeys(Object.keys(value))
  )
}

function collectSpanTexts(blocks) {
  const texts = []
  const walk = (node) => {
    if (node == null) return
    if (Array.isArray(node)) return node.forEach(walk)
    if (typeof node !== 'object') return
    if (node._type === 'span' && typeof node.text === 'string' && node.text.trim()) {
      texts.push(node.text)
    }
    for (const child of Object.values(node)) walk(child)
  }
  walk(blocks)
  return texts
}

function applySpanTexts(blocks, translations) {
  const cloned = JSON.parse(JSON.stringify(blocks))
  let index = 0
  const walk = (node) => {
    if (node == null) return
    if (Array.isArray(node)) return node.forEach(walk)
    if (typeof node !== 'object') return
    if (node._type === 'span' && typeof node.text === 'string' && node.text.trim()) {
      if (index < translations.length) {
        node.text = translations[index]
        index += 1
      }
    }
    for (const child of Object.values(node)) walk(child)
  }
  walk(cloned)
  return cloned
}

function buildPatch(doc) {
  const setPayload = {}

  const walk = (value, path) => {
    if (value == null) return

    if (isLocalizedString(value)) {
      const es = normalize(value.es)
      if (!es) return
      const en = typeof value.en === 'string' ? normalize(value.en) : ''
      if (!en || en === es) {
        setPayload[`${path}.en`] = translateLine(value.es)
      }
      return
    }

    if (isLocalizedBlocks(value)) {
      if (!value.es?.length) return
      const spans = collectSpanTexts(value.es)
      const enSpans = value.en?.length ? collectSpanTexts(value.en) : []
      const missing =
        !value.en?.length ||
        (spans.length && JSON.stringify(spans) === JSON.stringify(enSpans))
      if (missing) {
        if (!spans.length) {
          setPayload[`${path}.en`] = value.es
        } else {
          setPayload[`${path}.en`] = applySpanTexts(
            value.es,
            spans.map(translateLine),
          )
        }
      }
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, `${path}[${i}]`))
      return
    }

    if (typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (key.startsWith('_')) continue
        walk(child, path ? `${path}.${key}` : key)
      }
    }
  }

  walk(doc, '')

  const details = Array.isArray(doc.details)
    ? doc.details.filter((d) => typeof d === 'string' && d.trim())
    : []
  const detailsEn = Array.isArray(doc.detailsEn) ? doc.detailsEn : []
  if (details.length && (!detailsEn.length || detailsEn.every((d, i) => d === details[i]))) {
    setPayload.detailsEn = details.map(translateLine)
  }

  return setPayload
}

async function patchDoc(id, setPayload) {
  if (!Object.keys(setPayload).length) return false
  await client.patch(id).set(setPayload).commit({autoGenerateArrayKeys: true})
  return true
}

async function main() {
  const types = [
    'piece',
    'exhibition',
    'homePage',
    'aboutPage',
    'categoryCarousel',
    'jewelryCarousels',
  ]
  const docs = await client.fetch(`*[_type in $types]`, {types})
  console.log(`Fetched ${docs.length} documents`)

  let updated = 0
  let skipped = 0
  const missing = []

  // Monkey-patch warn to collect misses
  const origWarn = console.warn
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('No translation')) {
      missing.push(args[1])
    }
    origWarn(...args)
  }

  for (const doc of docs) {
    const setPayload = buildPatch(doc)
    const keys = Object.keys(setPayload)
    if (!keys.length) {
      skipped += 1
      continue
    }

    const label = doc.slug?.current || doc._id
    console.log(`\n→ ${doc._type} ${label} (${keys.length} fields)`)
    await patchDoc(doc._id, setPayload)
    updated += 1

    // Keep draft in sync if a sibling draft/published exists
    const publishedId = String(doc._id).replace(/^drafts\./, '')
    const draftId = `drafts.${publishedId}`
    const siblingId = doc._id.startsWith('drafts.') ? publishedId : draftId
    if (siblingId !== doc._id) {
      const sibling = await client.getDocument(siblingId)
      if (sibling) {
        const siblingPatch = buildPatch(sibling)
        if (Object.keys(siblingPatch).length) {
          await patchDoc(siblingId, siblingPatch)
          console.log(`  also patched ${siblingId}`)
        }
      }
    }
  }

  console.warn = origWarn
  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`)
  if (missing.length) {
    console.log(`Unmapped strings (${missing.length}):`)
    for (const m of [...new Set(missing)]) console.log(' ', m)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
