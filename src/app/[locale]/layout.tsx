import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {NextIntlClientProvider, hasLocale} from 'next-intl'
import {getMessages, setRequestLocale} from 'next-intl/server'
import {Figtree, Syne} from 'next/font/google'
import {CartProvider} from '@/lib/cart'
import {getSettings, getPiecesByCategory} from '@/lib/content'
import {collectPieceTypes} from '@/lib/piece-types'
import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {CartDrawer} from '@/components/CartDrawer'
import {JsonLd} from '@/components/JsonLd'
import {routing} from '@/i18n/routing'
import type {Locale} from '@/lib/types'
import '../globals.css'

const bodyFont = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
})

const displayFont = Syne({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: {
    default: 'VIVI Taller de Arte',
    template: '%s | VIVI Taller de Arte',
  },
  description:
    'Joyería artesanal, cerámica, ilustración y pintura hechas en Perú. VIVI Taller de Arte.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const messages = await getMessages()
  const settings = await getSettings()
  const localeKey = locale as Locale
  const [joyeriaPieces, ceramicaPieces, ilustracionesPieces, pinturaPieces] =
    await Promise.all([
      getPiecesByCategory('joyeria'),
      getPiecesByCategory('ceramica'),
      getPiecesByCategory('ilustraciones'),
      getPiecesByCategory('pintura'),
    ])
  const joyeriaTypes = collectPieceTypes(joyeriaPieces, localeKey)
  const ceramicaTypes = collectPieceTypes(ceramicaPieces, localeKey)
  const ilustracionesTypes = collectPieceTypes(ilustracionesPieces, localeKey)
  const pinturaTypes = collectPieceTypes(pinturaPieces, localeKey)

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: settings.siteName || 'VIVI Taller de Arte',
    email: settings.email,
    telephone: settings.whatsapp ? `+${settings.whatsapp}` : undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    address: settings.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressCountry: 'PE',
          addressLocality: settings.city,
        }
      : {
          '@type': 'PostalAddress',
          addressCountry: 'PE',
          addressLocality: settings.city || 'Perú',
        },
    sameAs: [
      settings.instagram?.startsWith('http')
        ? settings.instagram
        : `https://www.instagram.com/${(settings.instagram || 'vivitallerdearte').replace(/^@/, '')}/`,
      settings.googleMapsUrl,
    ].filter(Boolean),
  }

  return (
    <html
      lang={locale}
      className={`${bodyFont.variable} ${displayFont.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <JsonLd data={localBusiness} />
            <Header
              joyeriaTypes={joyeriaTypes}
              ceramicaTypes={ceramicaTypes}
              ilustracionesTypes={ilustracionesTypes}
              pinturaTypes={pinturaTypes}
            />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} />
            <CartDrawer whatsapp={settings.whatsapp || '51954734273'} />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
