import ProductCatalogue from '@/components/ProductCatalogue'
import { getProducts } from '@/lib/catalog'

export const metadata = {
  title: 'Products — Sri Sai Ramakrishna Paints & Hardware',
}

export default async function ProductsPage() {
  const products = await getProducts()

  return <ProductCatalogue products={products} />
}
