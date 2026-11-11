import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/adminAuth'
import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { DEFAULT_STATUS } from '@/lib/orderStatus'
import OrdersBoard from '@/components/admin/OrdersBoard'

export const dynamic = 'force-dynamic'

// Orders are loaded newest first, this many at a time ("Show older orders" adds another page)
const PAGE_SIZE = 300
const MAX_PAGES = 20

export default async function AdminPage({ searchParams }) {
  if (!(await isAdmin())) redirect('/admin/login')

  const requested = Number((await searchParams)?.pages)
  const pages = Number.isInteger(requested) ? Math.min(Math.max(requested, 1), MAX_PAGES) : 1
  const limit = pages * PAGE_SIZE

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('placed_at', { ascending: false })
    .limit(limit)

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
      limit={limit}
      olderHref={pages < MAX_PAGES ? `/admin?pages=${pages + 1}` : null}
    />
  )
}
