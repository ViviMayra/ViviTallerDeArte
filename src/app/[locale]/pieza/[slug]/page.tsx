import {notFound} from 'next/navigation'
import {getLocale, getTranslations, setRequestLocale} from 'next-intl/server'
import type {Metadata} from 'next'
import {Link} from '@/i18n/navigation'
import {AddToCartButton} from '@/components/AddToCartButton'
import {JsonLd} from '@/components/JsonLd'
import {PieceCard} from '@/components/PieceCard'
import {ProductGallery} from '@/components/ProductGallery'
import {ShareButton} from '@/components/ShareButton'
import {getPieceBySlug, getRelatedPieces} from '@/lib/content'
import {formatPrice, t} from '@/lib/locale'
import {getImageUrl} from '@/lib/images'
import type {Category, Locale} from '@/lib/types'

type Props = {params: Promise<{locale: string; slug: string}>}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const piece = await getPieceBySlug(slug)
  if (!piece) return {}
  const locale = (await getLocale()) as Locale
  return {
    title: piece.seo?.title || t(piece.title, locale),
    description:
      piece.seo?.description || t(piece.description, locale) || undefined,
    openGraph: {
      images: getImageUrl(piece.photos?.[0])
        ? [getImageUrl(piece.photos?.[0])!]
        : undefined,
    },
    alternates: {
      languages: {
        es: `/es/pieza/${slug}`,
        en: `/en/pieza/${slug}`,
      },
    },
  }
}

export default async function PiecePage({params}: Props) {
  const {locale: localeParam, slug} = await params
  setRequestLocale(localeParam)
  const locale = (await getLocale()) as Locale
  const piece = await getPieceBySlug(slug)
  if (!piece) notFound()

  const related = await getRelatedPieces(piece.category as Category, slug)
  const common = await getTranslations('common')
  const sold = piece.status === 'sold'
  const title = t(piece.title, locale)
  const imageUrl = getImageUrl(piece.photos?.[0], 800)

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: t(piece.description, locale),
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PEN',
      price: piece.price,
      availability:
        piece.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <JsonLd data={productLd} />
      <Link
        href={`/${piece.category === 'joyeria' ? 'joyeria' : piece.category}`}
        className="text-xs text-muted hover:text-foreground"
      >
        ← {common('back')}
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="md:order-2">
          <ProductGallery
            photos={piece.photos || []}
            locale={locale}
            sold={sold}
            title={title}
          />
        </div>

        <div className="md:order-1">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-ochre-deep md:text-4xl">
            {title}
          </h1>
          <p className={`mt-3 text-lg ${sold ? 'text-sold' : ''}`}>
            {formatPrice(piece.price, locale)}
          </p>
          {piece.description && (
            <p className="mt-6 max-w-md leading-relaxed text-muted">
              {t(piece.description, locale)}
            </p>
          )}
          {piece.details?.some((d) => d?.trim()) && (
            <div className="mt-8">
              <h2 className="text-sm font-medium">{common('details')}:</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                {piece.details.map((detail, i) => {
                  if (!detail?.trim()) return null
                  return (
                    <li key={i}>
                      {locale === 'en' && piece.detailsEn?.[i]
                        ? piece.detailsEn[i]
                        : detail}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <div className="mt-10">
            <AddToCartButton
              sold={sold}
              item={{
                id: piece._id,
                slug: piece.slug,
                title,
                price: piece.price,
                imageUrl,
                category: piece.category,
              }}
            />
          </div>
          <ShareButton />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-14">
          <h2 className="mb-10 text-center text-sm uppercase tracking-[0.16em]">
            {common('related')}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {related.map((item) => (
              <PieceCard key={item._id} piece={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
