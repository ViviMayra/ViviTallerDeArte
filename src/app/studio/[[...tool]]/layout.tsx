import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'VIVI Studio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
    // attributes on <html>/<body> before React hydrates.
    <html lang="es" suppressHydrationWarning>
      <body style={{margin: 0}} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
