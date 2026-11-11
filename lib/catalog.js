import 'server-only'
import { cache } from 'react'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { catalogue as fallbackCatalogue, hasPacks } from '@/data/products'

// ⚠️ Server-side only (uses the service-role client).
//
// The live catalogue is the Supabase `products` table, edited from
// /admin/products. If the table can't be read (not created yet, or
// Supabase is down) we fall back to data/products.js so the shop
// keeps working.

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

// Every product, including hidden ones. `source` tells the admin
// page whether it's looking at the database or the fallback file.
export const getCatalogue = cache(async () => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(COLUMNS)
    .order('id', { ascending: true })

  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Products fetch error — using data/products.js:', reason)
    return { products: fallbackCatalogue.map(p => ({ ...p, active: true })), source: 'file', reason }
  }
  return { products: data.map(fromRow), source: 'database' }
})

// What customers see: visible products that have something to order
export const getProducts = cache(async () => {
  const { products } = await getCatalogue()
  return products.filter(p => p.active && hasPacks(p))
})

export async function getProductById(id) {
  const { products, source, reason } = await getCatalogue()
  return { product: products.find(p => p.id === id) ?? null, source, reason }
}
