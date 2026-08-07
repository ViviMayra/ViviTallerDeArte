import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {NextIntlClientProvider, hasLocale} from 'next-intl'
import {getMessages, setRequestLocale} from 'next-intl/server'
import {
  Cormorant_Garamond,
  Figtree,
  Great_Vibes,
  Lora,
  Syne,
} from 'next/font/google'
import {CartProvider} from '@/lib/cart'
import {
  getSettings,
  getPiecesByCategory,
  getCategoryTypeOrder,
} from '@/lib/content'
import {
  collectJewelryTypesByGender,
  collectPieceTypes,
} from '@/lib/piece-types'
import {Header} from '@/components/Header'
import {Footer} from '@/components/Footer'
import {CartDrawer} from '@/components/CartDrawer'
import {WhatsAppSun} from '@/components/WhatsAppSun'
import {JsonLd} from '@/components/JsonLd'
import {getImageUrl} from '@/lib/images'
import {
  SITE_NAME,
  defaultSiteDescription,
} from '@/lib/seo'
import {getSiteUrl} from '@/lib/site-url'
import {facebookUrl, instagramUrl, tiktokUrl} from '@/lib/social'
import {routing} from '@/i18n/routing'
import type {Locale} from '@/lib/types'
import {Analytics} from '@vercel/analytics/next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import '../globals.css'

const siteUrl = getSiteUrl()
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim()

const bodyFont = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
})

const displayFont = Syne({
  subsets: ['latin'],
  variable: '--font-display',
})

const serifFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
})

const softSerifFont = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-soft',
})

const scriptFont = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
})

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultSiteDescription('es'),
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  authors: [{name: SITE_NAME, url: siteUrl}],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    'VIVI',
    'Taller de Arte',
    'joyería artesanal',
    'cerámica',
    'ilustraciones',
    'pintura',
    'Perú',
    'handmade jewelry',
    'Peru art',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_PE',
    alternateLocale: ['en_US'],
    url: siteUrl,
    images: [{url: '/logo.png', alt: SITE_NAME}],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: defaultSiteDescription('es'),
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: googleVerification
    ? {google: googleVerification}
    : undefined,
  category: 'arts',
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
  const [
    joyeriaPieces,
    ceramicaPieces,
    ilustracionesPieces,
    pinturaPieces,
    joyeriaTypeOrder,
    ceramicaTypeOrder,
    ilustracionesTypeOrder,
    pinturaTypeOrder,
  ] = await Promise.all([
    getPiecesByCategory('joyeria'),
    getPiecesByCategory('ceramica'),
    getPiecesByCategory('ilustraciones'),
    getPiecesByCategory('pintura'),
    getCategoryTypeOrder('joyeria'),
    getCategoryTypeOrder('ceramica'),
    getCategoryTypeOrder('ilustraciones'),
    getCategoryTypeOrder('pintura'),
  ])
  const joyeriaTypesByGender = collectJewelryTypesByGender(
    joyeriaPieces,
    localeKey,
    joyeriaTypeOrder,
  )
  const ceramicaTypes = collectPieceTypes(
    ceramicaPieces,
    localeKey,
    ceramicaTypeOrder,
  )
  const ilustracionesTypes = collectPieceTypes(
    ilustracionesPieces,
    localeKey,
    ilustracionesTypeOrder,
  )
  const pinturaTypes = collectPieceTypes(
    pinturaPieces,
    localeKey,
    pinturaTypeOrder,
  )

  const businessName = settings.siteName || SITE_NAME
  const logoUrl =
    getImageUrl(settings.logo, 1600, {
      fit: 'max',
      quality: 100,
      autoFormat: false,
    }) || `${siteUrl}/logo.png`
  const sameAs = [
    instagramUrl(settings.instagram),
    facebookUrl(settings.facebook),
    tiktokUrl(settings.tiktok),
    settings.googleMapsUrl,
  ].filter(Boolean)

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ArtGallery'],
    '@id': `${siteUrl}/#business`,
    name: businessName,
    email: settings.email,
    telephone: settings.whatsapp ? `+${settings.whatsapp}` : undefined,
    url: siteUrl,
    image: logoUrl,
    logo: logoUrl,
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
    sameAs,
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: businessName,
    url: siteUrl,
    inLanguage: ['es', 'en'],
    publisher: {'@id': `${siteUrl}/#business`},
  }

  // High-res PNG for crisp logo on retina; skip auto-format so it stays sharp.
  const logoSrc =
    getImageUrl(settings.logo, 1600, {
      fit: 'max',
      quality: 100,
      autoFormat: false,
    }) || '/logo.png'

  const social = {
    instagram: instagramUrl(settings.instagram),
    facebook: facebookUrl(settings.facebook),
    tiktok: tiktokUrl(settings.tiktok),
  }

  return (
    <html
      lang={locale}
      className={`${bodyFont.variable} ${displayFont.variable} ${serifFont.variable} ${softSerifFont.variable} ${scriptFont.variable} h-full`}
    >
      <body className="relative flex min-h-full flex-col antialiased">
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <JsonLd data={localBusiness} />
            <JsonLd data={websiteLd} />
            <Header
              logoSrc={logoSrc}
              social={social}
              joyeriaTypesByGender={joyeriaTypesByGender}
              ceramicaTypes={ceramicaTypes}
              ilustracionesTypes={ilustracionesTypes}
              pinturaTypes={pinturaTypes}
            />
            <main className="flex-1 pt-32 md:pt-40">{children}</main>
            <Footer settings={settings} />
            <CartDrawer whatsapp={settings.whatsapp || '51954734273'} />
            <WhatsAppSun whatsapp={settings.whatsapp || '51954734273'} />
          </CartProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
