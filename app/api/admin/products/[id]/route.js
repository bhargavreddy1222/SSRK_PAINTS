import { revalidatePath } from 'next/cache'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { validateProduct } from '@/lib/productSchema'

// PUT /api/admin/products/:id  → replace a product's details
export async function PUT(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { id } = await params
  const input = await request.json().catch(() => null)
  const { product, error } = validateProduct(input)
  if (error) return Response.json({ error }, { status: 400 })

  return save(id, { ...product, updated_at: new Date().toISOString() })
}

// PATCH /api/admin/products/:id  { active }  → show / hide only
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { id } = await params
  const { active } = await request.json().catch(() => ({}))
  if (typeof active !== 'boolean') {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  return save(id, { active, updated_at: new Date().toISOString() })
}

// DELETE /api/admin/products/:id
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { id } = await params
  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Product delete error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }

  revalidatePath('/', 'layout')
  return Response.json({ success: true })
}

async function save(id, changes) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(changes)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Product update error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }
  if (!data) return Response.json({ error: 'Product not found' }, { status: 404 })

  revalidatePath('/', 'layout')
  return Response.json({ success: true, id: data.id })
}
