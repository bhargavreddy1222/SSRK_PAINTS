import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartBar from '@/components/CartBar'
import { CartProvider } from '@/context/CartContext'

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[300] focus:bg-stone-900 focus:text-white focus:px-4 focus:py-3 focus:rounded-xl focus:font-bold focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <Footer />
      <CartBar />
    </CartProvider>
  )
}
