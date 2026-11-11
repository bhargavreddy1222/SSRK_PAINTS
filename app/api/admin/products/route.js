import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { refreshShop } from '@/lib/catalog'
import { imageHost } from '@/lib/productImages'
import { validateProduct } from '@/lib/productSchema'

// POST /api/admin/products  → create a product
export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const input = await request.json().catch(() => null)
  const { product, error } = validateProduct(input, { imageHost: imageHost() })
  if (error) return Response.json({ error }, { status: 400 })

  const { data, error: dbError } = await supabaseAdmin
    .from('products')
    .insert(product)
    .select('id')
    .single()

  if (dbError) {
    const reason = describeSupabaseError(dbError)
    console.error('Product create error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }

  refreshShop()
  return Response.json({ success: true, id: data.id })
}
