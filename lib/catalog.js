import 'server-only'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { shopProduct } from '@/lib/products'

// ⚠️ Server-side only (uses the service-role client).
//
// The catalogue is the Supabase `products` table, edited from /admin/products.
//
// If the table can't be read:
//  • in production the shop shows nothing rather than guess. Pages that are
//    already built keep showing their last good copy, new ones show the
//    "call us" error screen, and orders are refused — so nobody is quoted a
//    price the shop didn't set.
//  • in development data/products.js stands in, so the site can be worked on
//    before the database exists.

// Thrown when the shop has no catalogue to show or price an order from
export class CatalogueUnavailableError extends Error {}

const COLUMNS = 'id, brand, name, category, type, image, description, bases, colors, packs, active'

function fromRow(row) {
  return {
    id:          row.id,
    brand:       row.brand,
    name:        row.name,
    category:    row.category,
    type:        row.type,
    image:       row.image ?? '',
    description: row.description ?? '',
    bases:       row.bases ?? undefined,
    colors:      row.colors ?? undefined,
    packs:       row.packs ?? undefined,
    active:      row.active,
  }
}

// Every product, including hidden ones. `source` tells the admin pages what
// they are looking at: 'database', 'file' (development stand-in) or 'unavailable'.
export const getCatalogue = cache(async () => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(COLUMNS)
    .order('id', { ascending: true })

  if (!error) return { products: data.map(fromRow), source: 'database' }

  const reason = describeSupabaseError(error)
  if (process.env.NODE_ENV === 'production') {
    console.error('Products fetch error:', reason)
    return { products: [], source: 'unavailable', reason }
  }

  console.error('Products fetch error — using data/products.js:', reason)
  const { catalogue } = await import('@/data/products')
  return { products: catalogue.map(p => ({ ...p, active: true })), source: 'file', reason }
})

// What customers see: visible products that have something to order.
// shopProduct also drops malformed rows, so one bad product can't break a page.
export const getProducts = cache(async () => {
  const { products, source, reason } = await getCatalogue()
  if (source === 'unavailable') throw new CatalogueUnavailableError(reason)
  return products.filter(p => p.active).map(shopProduct).filter(Boolean)
})

// For the admin editor (hidden and unfinished products included)
export async function getProductById(id) {
  const { products, source, reason } = await getCatalogue()
  return { product: products.find(p => p.id === id) ?? null, source, reason }
}

// Call after any change to products, so the shop shows it straight away
export function refreshShop() {
  revalidatePath('/', 'layout')
  revalidatePath('/api/catalogue')
}
