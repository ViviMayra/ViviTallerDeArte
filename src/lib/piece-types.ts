import {slugify} from './slugify'
import {t} from './locale'
import type {Locale, Piece, PieceTypeLabel} from './types'

function discoverPieceTypes(pieces: Piece[]): PieceTypeLabel[] {
  const map = new Map<string, PieceTypeLabel>()
  for (const piece of pieces) {
    const es = piece.pieceType?.es?.trim()
    if (!es) continue
    const slug = slugify(es)
    if (!slug || map.has(slug)) continue
    map.set(slug, {
      slug,
      label: {
        es,
        en: piece.pieceType?.en?.trim() || es,
      },
    })
  }
  return Array.from(map.values())
}

/** Apply Studio drag-order (Spanish type names), then alphabetical for the rest. */
export function applyTypeOrder(
  types: PieceTypeLabel[],
  preferredOrder: string[] | undefined,
  locale: Locale,
): PieceTypeLabel[] {
  if (!preferredOrder?.length) {
    return [...types].sort((a, b) =>
      t(a.label, locale).localeCompare(t(b.label, locale), locale),
    )
  }

  const bySlug = new Map(types.map((type) => [type.slug, type]))
  const used = new Set<string>()
  const ordered: PieceTypeLabel[] = []

  for (const name of preferredOrder) {
    const slug = slugify(name.trim())
    if (!slug || used.has(slug)) continue
    const match = bySlug.get(slug)
    if (!match) continue
    ordered.push(match)
    used.add(slug)
  }

  const rest = types
    .filter((type) => !used.has(type.slug))
    .sort((a, b) =>
      t(a.label, locale).localeCompare(t(b.label, locale), locale),
    )

  return [...ordered, ...rest]
}

/** Unique piece types found on pieces (typed inline in Studio). */
export function collectPieceTypes(
  pieces: Piece[],
  locale: Locale,
  preferredOrder?: string[],
): PieceTypeLabel[] {
  return applyTypeOrder(discoverPieceTypes(pieces), preferredOrder, locale)
}

/** Types used under Mujer / Hombre (for nested nav). */
export function collectJewelryTypesByGender(
  pieces: Piece[],
  locale: Locale,
  preferredOrder?: string[],
): {mujer: PieceTypeLabel[]; hombre: PieceTypeLabel[]} {
  return {
    mujer: collectPieceTypes(
      pieces.filter((p) => p.gender === 'mujer'),
      locale,
      preferredOrder,
    ),
    hombre: collectPieceTypes(
      pieces.filter((p) => p.gender === 'hombre'),
      locale,
      preferredOrder,
    ),
  }
}

export function pieceTypeSlug(piece: Piece): string | null {
  const es = piece.pieceType?.es?.trim()
  return es ? slugify(es) : null
}

/** Anchor unique per gender + type, e.g. mujer-collares */
export function genderTypeAnchor(
  gender: 'mujer' | 'hombre' | 'general',
  typeSlug: string,
) {
  return `${gender}-${typeSlug}`
}
