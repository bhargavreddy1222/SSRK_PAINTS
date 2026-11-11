import { supabaseAdmin, describeSupabaseError } from '@/lib/supabaseAdmin'
import { resend } from '@/lib/resend'
import { resolveOrderLine } from '@/data/products'
import { getProducts } from '@/lib/catalog'
import { orderRef } from '@/lib/orderStatus'
import { clientIp, createRateLimiter } from '@/lib/rateLimit'

const PHONE_RE = /^[6-9]\d{9}$/
// Also blocks characters that could add extra headers to the admin's mailto: link
const EMAIL_RE = /^[^\s@<>"'(),:;?&]+@[^\s@<>"'(),:;?&]+\.[^\s@<>"'(),:;?&]+$/
const MAX_LINES = 50
const MAX_QTY   = 999

const orderLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 })
// Anyone can type any address into the form, so one address can't be flooded with our emails
const emailLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 3 })

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const rupees = n => `₹${n.toLocaleString('en-IN')}`

export async function POST(request) {
  try {
    const ip = clientIp(request)
    if (orderLimiter.isLimited(ip)) {
      return Response.json({ error: 'Too many orders. Please call us instead.' }, { status: 429 })
    }
    orderLimiter.hit(ip)

    const payload = await request.json()
    const { customer, items } = payload ?? {}

    // ── Backend validation (mirrors the frontend validate()) ──
    const name  = String(customer?.name  ?? '').trim()
    const phone = String(customer?.phone ?? '').trim()
    const email = String(customer?.email ?? '').trim()
    const notes = String(customer?.notes ?? '').trim()

    if (!name || name.length > 100)  return badRequest('Enter a valid name')
    if (!PHONE_RE.test(phone))       return badRequest('Enter a valid 10-digit mobile number')
    // Email is optional; a skipped one is saved as '' (orders.email is NOT NULL)
    if (email && (!EMAIL_RE.test(email) || email.length > 200)) return badRequest('Enter a valid email address')
    if (notes.length > 1000)         return badRequest('Notes are too long')
    if (!Array.isArray(items) || !items.length || items.length > MAX_LINES) {
      return badRequest('Your order is empty or too large')
    }

    // ── Prices come from the catalogue, never from the browser ──
    const catalogue = await getProducts()
    const lines = []
    for (const item of items) {
      const qty  = Number(item?.qty)
      const line = resolveOrderLine(catalogue, Number(item?.productId), item?.pack, item?.option ?? null)
      if (!line || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return badRequest('One of the items in your order is no longer available. Please refresh and try again.')
      }
      lines.push({
        product_id: line.product.id,
        product:    line.product.name,
        brand:      line.product.brand,
        pack:       line.pack.size,
        option:     line.option,
        price:      line.pack.price,
        qty,
        subtotal:   line.pack.price * qty,
      })
    }

    const total_items     = lines.reduce((sum, l) => sum + l.qty, 0)
    const estimated_total = lines.reduce((sum, l) => sum + l.subtotal, 0)

    // ── 1. Save to Supabase ──
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: name,
        phone,
        email,
        notes: notes || null,
        items: lines,
        total_items,
        estimated_total,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', describeSupabaseError(error))
      return Response.json({ error: 'Failed to save order' }, { status: 500 })
    }

    // ── 2. Email confirmation via Resend ──
    // The order is already saved, so an email failure must not
    // turn into an error response (the customer would re-submit).
    try {
      const emailHtml = buildEmail({ name, phone, notes, lines, total_items, estimated_total })
      const shopEmail = process.env.SHOP_ORDER_EMAIL
      const emailKey = email.toLowerCase()
      const emailCustomer = Boolean(email) && !emailLimiter.isLimited(emailKey)
      if (emailCustomer) emailLimiter.hit(emailKey)
      // No customer email → the shop still gets its copy
      const to = emailCustomer ? email : shopEmail

      if (to) {
        const { error: emailError } = await resend.emails.send({
          // onboarding@resend.dev can only deliver to your own Resend account.
          // Verify a domain in Resend and set RESEND_FROM, e.g. "Sri Sai Paints <orders@yourdomain.com>".
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to,
          ...(emailCustomer && shopEmail && { bcc: shopEmail }),
          subject: `Order #${orderRef(order.id)} Received — Sri Sai Ramakrishna Paints & Hardware`,
          html: emailHtml,
        })

        if (emailError) console.error('Resend email error:', emailError)
      }
    } catch (emailErr) {
      console.error('Resend email error:', emailErr)
    }

    return Response.json({ success: true, orderId: order.id })

  } catch (err) {
    console.error('Order API error:', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

function badRequest(message) {
  return Response.json({ error: message }, { status: 400 })
}

function buildEmail({ name, phone, notes, lines, total_items, estimated_total }) {
  const itemRows = lines.map(item => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;">
          <div style="font-weight:600;color:#1c1917;">${escapeHtml(item.product)}</div>
          <div style="font-size:13px;color:#78716c;">${escapeHtml(item.brand)}${item.option ? ' · ' + escapeHtml(item.option) : ''} · ${escapeHtml(item.pack)}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:center;color:#44403c;">${item.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:right;color:#44403c;">${rupees(item.price)}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:right;font-weight:600;color:#1c1917;">${rupees(item.subtotal)}</td>
      </tr>
    `).join('')

  return `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1c1917;">
        <h2 style="margin-bottom:4px;">Order Received</h2>
        <p style="color:#57534e;margin-top:0;">Hi ${escapeHtml(name)}, thanks for your order! We'll call or WhatsApp you on ${escapeHtml(phone)} shortly to confirm pricing and availability.</p>

        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <thead>
            <tr style="background:#f5f5f4;">
              <th style="padding:8px;text-align:left;font-size:13px;color:#78716c;">Item</th>
              <th style="padding:8px;text-align:center;font-size:13px;color:#78716c;">Qty</th>
              <th style="padding:8px;text-align:right;font-size:13px;color:#78716c;">Price</th>
              <th style="padding:8px;text-align:right;font-size:13px;color:#78716c;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="text-align:right;margin-top:12px;font-size:16px;">
          <strong>Total (${total_items} item${total_items !== 1 ? 's' : ''}): ${rupees(estimated_total)}</strong>
        </div>

        ${notes ? `<p style="margin-top:16px;color:#57534e;"><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ''}

        <p style="margin-top:24px;font-size:13px;color:#a8a29e;">Sri Sai Ramakrishna Paints &amp; Hardware · Guntur, AP</p>
      </div>
    `
}
