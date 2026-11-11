import { getProducts } from '@/lib/catalog'
import { productPath } from '@/lib/products'
import { SHOP } from '@/lib/shop'

export const revalidate = 3600

export default async function sitemap() {
  // If the catalogue can't be read, still publish the pages that don't depend on it
  const products = await getProducts().catch(() => [])
  return ['', '/products', ...products.map(productPath)].map(path => ({ url: `${SHOP.url}${path}` }))
}
