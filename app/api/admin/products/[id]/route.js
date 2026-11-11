import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { refreshShop } from '@/lib/catalog'
import { imageHost, removeUnusedImage } from '@/lib/productImages'
import { validateProduct } from '@/lib/productSchema'

const notLoggedIn = () => Response.json({ error: 'Not logged in' }, { status: 401 })
const notFound    = () => Response.json({ error: 'Product not found' }, { status: 404 })

// Product ids are whole numbers; anything else can't exist
async function productId(params) {
  const { id } = await params
  return /^[1-9]\d{0,14}$/.test(id) ? Number(id) : null
}

function failed(action, error) {
  const reason = describeSupabaseError(error)
  console.error(`Product ${action} error:`, reason)
  return Response.json({ error: reason }, { status: 500 })
}

// PUT /api/admin/products/:id  → replace a product's details
export async function PUT(request, { params }) {
  if (!(await isAdmin())) return notLoggedIn()

  const id = await productId(params)
  if (id === null) return notFound()

  const input = await request.json().catch(() => null)
  const { product, error } = validateProduct(input, { imageHost: imageHost() })
  if (error) return Response.json({ error }, { status: 400 })

  // Remember the current photo, so it can be deleted if this save replaces it
  const { data: before, error: readError } = await supabaseAdmin
    .from('products')
    .select('image')
    .eq('id', id)
    .maybeSingle()
  if (readError) return failed('update', readError)
  if (!before) return notFound()

  const response = await save(id, { ...product, updated_at: new Date().toISOString() })
  if (response.ok && before.image !== product.image) await removeUnusedImage(before.image)
  return response
}

// PATCH /api/admin/products/:id  { active }  → show / hide only
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return notLoggedIn()

  const id = await productId(params)
  if (id === null) return notFound()

  const { active } = await request.json().catch(() => ({}))
  if (typeof active !== 'boolean') {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  return save(id, { active, updated_at: new Date().toISOString() })
}

// DELETE /api/admin/products/:id
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return notLoggedIn()

  const id = await productId(params)
  if (id === null) return notFound()

  const { data, error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)
    .select('image')
    .maybeSingle()
  if (error) return failed('delete', error)
  if (!data) return notFound()

  await removeUnusedImage(data.image)
  refreshShop()
  return Response.json({ success: true })
}

async function save(id, changes) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(changes)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return failed('update', error)
  if (!data) return notFound()

  refreshShop()
  return Response.json({ success: true, id: data.id })
}
