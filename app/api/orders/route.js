import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { supabase } from '@/lib/supabase'
import { resend } from '@/lib/resend'

export async function POST(request) {
  try {
    const payload = await request.json()
    const { customer, items, total_items, estimated_total, placed_at } = payload

    // ── Backend validation (mirrors your frontend validate()) ──
    if (!customer?.name || !customer?.phone || !customer?.email || !items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── 1. Save to Supabase ──
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: customer.name,
        phone: customer.phone,
        email: customer.email,
        notes: customer.notes || null,
        items,
        total_items,
        estimated_total,
        placed_at,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return Response.json({ error: 'Failed to save order' }, { status: 500 })
    }

    // ── 2. Email confirmation via Resend ──
    const itemRows = items.map(item => `
      <tr>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;">
          <div style="font-weight:600;color:#1c1917;">${item.product}</div>
          <div style="font-size:13px;color:#78716c;">${item.brand}${item.option ? ' · ' + item.option : ''} · ${item.pack}</div>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:center;color:#44403c;">${item.qty}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:right;color:#44403c;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding:10px 8px;border-bottom:1px solid #e7e5e4;text-align:right;font-weight:600;color:#1c1917;">₹${item.subtotal.toLocaleString('en-IN')}</td>
      </tr>
    `).join('')

    const emailHtml = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1c1917;">
        <h2 style="margin-bottom:4px;">Order Received</h2>
        <p style="color:#57534e;margin-top:0;">Hi ${customer.name}, thanks for your order! We'll call or WhatsApp you on ${customer.phone} shortly to confirm pricing and availability.</p>

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
          <strong>Total (${total_items} item${total_items !== 1 ? 's' : ''}): ₹${estimated_total.toLocaleString('en-IN')}</strong>
        </div>

        ${customer.notes ? `<p style="margin-top:16px;color:#57534e;"><strong>Notes:</strong> ${customer.notes}</p>` : ''}

        <p style="margin-top:24px;font-size:13px;color:#a8a29e;">Sri Sai Ramakrishna Paints & Hardware · Guntur, AP</p>
      </div>
    `

  const { data: emailData, error: emailError } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: customer.email,
  subject: 'Order Received — Sri Sai Ramakrishna Paints & Hardware',
  html: emailHtml,
})

if (emailError) {
  console.error('Resend email error:', emailError)
} else {
  console.log('Email sent successfully:', emailData)
}

    return Response.json({ success: true, orderId: order.id })

  } catch (err) {
    console.error('Order API error:', err)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}