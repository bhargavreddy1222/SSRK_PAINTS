import ProductCatalogue from '@/components/ProductCatalogue'
import { getProducts } from '@/lib/catalog'

// Re-check the catalogue at least hourly; admin edits refresh it immediately
export const revalidate = 3600

export const metadata = {
  title: 'Products — Sri Sai Ramakrishna Paints & Hardware',
  description: 'Prices and pack sizes for Asian Paints, Berger, Sheenlac, Saincoat, JK and Birla wall putty in Guntur. Build your order online and we confirm by phone or WhatsApp.',
  alternates: { canonical: '/products' },
  openGraph: { title: 'Products — Sri Sai Ramakrishna Paints & Hardware', url: '/products' },
}

export default async function ProductsPage() {
  const products = await getProducts()

  return <ProductCatalogue products={products} />
}
