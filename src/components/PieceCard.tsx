import {getLocale, getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/navigation'
import {SoldBadge} from '@/components/SoldBadge'
import {formatPrice, t} from '@/lib/locale'
import {getImageAlt, getImageUrl} from '@/lib/images'
import type {Locale, Piece} from '@/lib/types'

export async function PieceCard({piece}: {piece: Piece}) {
  const locale = (await getLocale()) as Locale
  const common = await getTranslations('common')
  const image = piece.photos?.[0]
  const src = getImageUrl(image, 800)
  const sold = piece.status === 'sold'
  const title = t(piece.title, locale)
  const href = piece.slug ? `/pieza/${piece.slug}` : null

  const body = (
    <>
      <div className="relative aspect-square overflow-hidden bg-line">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={getImageAlt(image, locale, title)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
              sold
                ? 'group-hover:grayscale-[30%] group-hover:brightness-95'
                : ''
            }`}
          />
        ) : null}
        {sold && <SoldBadge label={common('sold')} />}
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm uppercase tracking-[0.08em]">{title}</h3>
        <p className={`mt-1 text-sm ${sold ? 'text-sold' : 'text-muted'}`}>
          {formatPrice(piece.price, locale)}
        </p>
      </div>
    </>
  )

  // Missing slug → broken /pieza/null page; show card but don't link yet
  if (!href) {
    return (
      <div className={`piece-card block ${sold ? 'is-sold' : ''}`}>{body}</div>
    )
  }

  return (
    <Link
      href={href}
      className={`piece-card group block ${sold ? 'is-sold' : ''}`}
    >
      {body}
    </Link>
  )
}
