import { getProducts } from '@/lib/catalog'
import { cartProduct } from '@/lib/products'

// Cached like the product pages; admin edits refresh it (refreshShop in lib/catalog.js)
export const revalidate = 3600

// GET /api/catalogue → names and prices only, for rebuilding a saved cart.
// Browsers ask for it only when they have a cart saved, so pages don't have
// to carry the whole catalogue for everyone.
export async function GET() {
  const products = await getProducts()
  return Response.json(products.map(cartProduct))
}
