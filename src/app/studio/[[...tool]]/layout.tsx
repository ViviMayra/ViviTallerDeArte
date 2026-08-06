export const metadata = {
  title: 'VIVI Studio',
}

export default function StudioLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body style={{margin: 0}}>{children}</body>
    </html>
  )
}
