import './globals.css'
import { Poppins } from 'next/font/google'
import { SHOP } from '@/lib/shop'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const TITLE = 'Sri Sai Ramakrishna Paints & Hardware — Guntur'
const DESCRIPTION = 'Authorized dealer for Asian Paints, Berger Paints, Sheenlac, Saincoat in Guntur, Andhra Pradesh.'

export const metadata = {
  metadataBase: new URL(SHOP.url),
  title: TITLE,
  description: DESCRIPTION,
  // The share image comes from app/opengraph-image.jsx
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Sri Sai Ramakrishna Paints & Hardware',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_IN',
  },
}

// Shared shell only — the shop chrome lives in app/(shop)/layout.jsx
// and the admin area has its own layout in app/admin/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${poppins.className} bg-stone-50 text-stone-900 antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
