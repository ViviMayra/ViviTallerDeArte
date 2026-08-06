import {getLocale, getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import {formatPrice, t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import type {Locale, Piece} from '@/lib/types'

export async function PieceCard({piece}: {piece: Piece}) {
  const locale = (await getLocale()) as Locale
  const common = await getTranslations('common')
  const image = piece.photos?.[0]
  const src = getImageUrl(image, 800)
  const sold = piece.status === 'sold'

  return (
    <Link
      href={`/pieza/${piece.slug}`}
      className={`piece-card group block ${sold ? 'is-sold' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden bg-line">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={getImageAlt(image, locale, t(piece.title, locale))}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${sold ? 'grayscale-[30%] brightness-95' : ''}`}
          />
        ) : null}
        {sold && (
          <span className="absolute left-3 top-3 bg-foreground/80 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-background">
            {common('sold')}
          </span>
        )}
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm uppercase tracking-[0.08em]">
          {t(piece.title, locale)}
        </h3>
        <p className={`mt-1 text-sm ${sold ? 'text-sold' : 'text-muted'}`}>
          {formatPrice(piece.price, locale)}
        </p>
      </div>
    </Link>
  )
}
