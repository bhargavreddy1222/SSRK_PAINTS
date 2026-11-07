import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { isAdmin } from '@/lib/adminAuth'
import { ORDER_STATUSES } from '@/lib/orderStatus'

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

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single()

  if (error) {
    const reason = describeSupabaseError(error)
    console.error('Order status update error:', reason)
    return Response.json({ error: reason }, { status: 500 })
  }

  return Response.json({ success: true, order: data })
}
