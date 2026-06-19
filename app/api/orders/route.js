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
  const { data: emailData, error: emailError } = await resend.emails.send({
  from: 'onboarding@resend.dev',
  to: customer.email,
  subject: 'Order Received — Sri Sai Ramakrishna Paints & Hardware',
  html: `<p>Hi ${customer.name}, we've received your order of ₹${estimated_total.toLocaleString('en-IN')} (${total_items} item${total_items !== 1 ? 's' : ''}). We'll call or WhatsApp you on ${customer.phone} shortly to confirm pricing and availability.</p>`,
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