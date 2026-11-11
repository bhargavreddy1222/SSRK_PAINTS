import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { DEFAULT_STATUS } from '@/lib/orderStatus'
import OrdersBoard from '@/components/admin/OrdersBoard'

export const dynamic = 'force-dynamic'

const ORDER_LIMIT = 300

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login')

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false })
    .limit(ORDER_LIMIT)

  const loadError = error ? describeSupabaseError(error) : null
  if (loadError) console.error('Admin orders fetch error:', loadError)

  const rows = data ?? []
  // If the status column hasn't been added yet, show the SQL to add it
  const statusMissing = rows.length > 0 && !('status' in rows[0])
  const orders = rows.map(o => ({ ...o, status: o.status ?? DEFAULT_STATUS }))

  return (
    <OrdersBoard
      orders={orders}
      loadError={loadError}
      statusMissing={statusMissing}
      limit={ORDER_LIMIT}
    />
  )
}
