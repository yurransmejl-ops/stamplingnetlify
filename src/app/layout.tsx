import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stämpelapp',
  description: 'En enkel stämpelapp för anställda',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
