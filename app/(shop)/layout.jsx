import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartBar from '@/components/CartBar'
import { CartProvider } from '@/context/CartContext'
import { getProducts } from '@/lib/catalog'

// Re-check the catalogue at least hourly; admin edits refresh it immediately
export const revalidate = 3600

export default async function ShopLayout({ children }) {
  const products = await getProducts()

  return (
    <CartProvider products={products}>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartBar />
    </CartProvider>
  )
}
