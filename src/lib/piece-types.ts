import {slugify} from './slugify'
import {t} from './locale'
import type {Locale, Piece, PieceTypeLabel} from './types'

/** Unique piece types found on pieces (typed inline in Studio). */
export function collectPieceTypes(
  pieces: Piece[],
  locale: Locale,
): PieceTypeLabel[] {
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
  return Array.from(map.values()).sort((a, b) =>
    t(a.label, locale).localeCompare(t(b.label, locale), locale),
  )
}

/** Types used under Mujer / Hombre (for nested nav). */
export function collectJewelryTypesByGender(
  pieces: Piece[],
  locale: Locale,
): {mujer: PieceTypeLabel[]; hombre: PieceTypeLabel[]} {
  return {
    mujer: collectPieceTypes(
      pieces.filter((p) => p.gender === 'mujer'),
      locale,
    ),
    hombre: collectPieceTypes(
      pieces.filter((p) => p.gender === 'hombre'),
      locale,
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
