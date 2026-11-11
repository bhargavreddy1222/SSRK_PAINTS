import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { ORDER_STATUSES } from '@/lib/orderStatus'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// PATCH /api/admin/orders/:id  { status }  → change an order's status
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await request.json().catch(() => ({}))
  if (!ORDER_STATUSES.some(s => s.id === status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (!UUID_RE.test(id)) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .maybeSingle()

  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Order status update error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }
  if (!data) return Response.json({ error: 'Order not found' }, { status: 404 })

  return Response.json({ success: true, order: data })
}
