import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { buildOrder, orderSignature } from '@/lib/orderRules'
import { CatalogueUnavailableError, getProducts } from '@/lib/catalog'
import { orderRef } from '@/lib/orderStatus'
import { clientIp, createRateLimiter } from '@/lib/rateLimit'

// 5 saved orders per IP per 10 minutes. Mistyped forms don't count towards it...
const orderLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 })
// ...but every request counts towards this one, so the endpoint can't be hammered
const requestLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 40 })

// A phone that loses the reply on a weak connection sends the order again.
// The same items from the same number within this window are that order, not a new one.
const RESEND_WINDOW_MS = 10 * 60 * 1000

const reply = (status, body) => Response.json(body, { status })

// POST /api/orders  { customer, items }  → saves the order for the shop to confirm.
// The shop sees it on /admin; the customer is offered a WhatsApp message to send.
export async function POST(request) {
  try {
    const ip = clientIp(request)
    if (orderLimiter.isLimited(ip) || requestLimiter.isLimited(ip)) {
      return reply(429, { error: 'Too many orders. Please call us instead.' })
    }
    requestLimiter.hit(ip)

    const payload = await request.json().catch(() => null)
    if (!payload) return reply(400, { error: 'Your order could not be read. Please try again.' })

    // ── Prices come from the catalogue, never from the browser ──
    const { error: invalid, customer, lines, totals } = buildOrder(payload, await getProducts())
    if (invalid) return reply(400, { error: invalid })

    // ── Already saved? (a retry after a lost reply) ──
    const signature = orderSignature(lines)
    const { data: recent } = await supabaseAdmin
      .from('orders')
      .select('id, items')
      .eq('phone', customer.phone)
      .gte('placed_at', new Date(Date.now() - RESEND_WINDOW_MS).toISOString())
      .order('placed_at', { ascending: false })
      .limit(5)
    const existing = recent?.find(o => Array.isArray(o.items) && orderSignature(o.items) === signature)
    if (existing) return reply(200, { success: true, orderId: existing.id, duplicate: true })

    // ── Save to Supabase ──
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customer.name,
        phone:         customer.phone,
        email:         customer.email, // optional; '' when skipped (orders.email is NOT NULL)
        notes:         customer.notes || null,
        items:         lines,
        ...totals,
        placed_at:     new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', describeSupabaseError(error))
      return reply(500, { error: 'We could not save your order.' })
    }

    orderLimiter.hit(ip)
    console.log(`New order #${orderRef(order.id)}: ${totals.total_items} item(s), ₹${totals.estimated_total}`)
    return reply(200, { success: true, orderId: order.id })

  } catch (err) {
    if (err instanceof CatalogueUnavailableError) {
      console.error('Order API: catalogue unavailable:', err.message)
      return reply(503, { error: 'We can’t take online orders right now.' })
    }
    console.error('Order API error:', err)
    return reply(500, { error: 'Something went wrong.' })
  }
}
