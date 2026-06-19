'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function OrderPage() {
  const { cart, updateQty, removeFromCart, clearCart, totalItems, totalPrice } = useCart()
  const [form,   setForm]   = useState({ name: '', phone: '', email: '', notes: '' })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim())                              errs.name  = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone))              errs.phone = 'Enter a valid 10-digit mobile number'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (cart.length === 0) { alert('Your order is empty.'); return }

    setStatus('submitting')
    setErrors({})

    const payload = {
      customer: form,
      items: cart.map(i => ({
        product:  i.name,
        brand:    i.brand,
        pack:     i.pack.size,
        price:    i.pack.price,
        option:   i.option,
        qty:      i.qty,
        subtotal: i.pack.price * i.qty,
      })),
      total_items: totalItems,
      estimated_total: totalPrice,
      placed_at: new Date().toISOString(),
    }

    try {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }

  setStatus('success')
  clearCart()
} catch {
  setStatus('error')
}
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-[5%] py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-5">✅</div>
          <h2 className="text-2xl font-extrabold mb-2">Order Received!</h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            Thanks <strong>{form.name}</strong>! We'll confirm your order on{' '}
            <strong>{form.phone}</strong> and send details to <strong>{form.email}</strong>.
          </p>
          <Link href="/products" className="inline-block bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            Browse More Products
          </Link>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-[5%] py-20">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="text-xl font-extrabold mb-2">Your order is empty</h2>
          <p className="text-stone-500 text-sm mb-6">Add products from the catalogue first.</p>
          <Link href="/products" className="inline-block bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            Go to Products →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 px-[5%] py-10">
      <div className="max-w-5xl mx-auto">

        <p className="text-orange-700 text-[0.7rem] font-bold uppercase tracking-widest mb-1">Checkout</p>
        <h1 className="text-3xl font-extrabold tracking-tight mb-8">Place Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ── Customer form ──────────────────── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-7">
            <h2 className="text-lg font-bold mb-1">Your Details</h2>
            <p className="text-stone-400 text-xs mb-6 leading-relaxed">
              We'll call or WhatsApp you on this number to confirm the order and pricing.
            </p>

            <Field label="Full Name" error={errors.name}>
              <input type="text" placeholder="Ravi Kumar" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={inputCls(errors.name)} />
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <input type="tel" placeholder="98765 43210" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className={inputCls(errors.phone)} />
            </Field>

            <Field label="Email Address" error={errors.email}>
              <input type="email" placeholder="ravi@gmail.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className={inputCls(errors.email)} />
            </Field>

            <Field label="Special Instructions (optional)">
              <textarea rows={3} placeholder="Specific shade, quantity notes, pickup time..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className={`${inputCls()} resize-y`} />
            </Field>

            {status === 'error' && (
              <p className="text-red-600 text-sm mb-4">Something went wrong. Please try again or call us directly.</p>
            )}

            <button onClick={handleSubmit} disabled={status === 'submitting'}
              className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-stone-400 text-white font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer border-0">
              {status === 'submitting' ? 'Placing Order…' : `Confirm Order (${totalItems} item${totalItems !== 1 ? 's' : ''})`}
            </button>
            <p className="text-stone-400 text-xs text-center mt-3">
              Final pricing confirmed by our team after review.
            </p>
          </div>

          {/* ── Order summary ───────────────────── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="flex flex-col gap-3 mb-5">
              {cart.map(item => (
                <div key={item._key} className="pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-snug">{item.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{item.brand}</p>
                      {/* Pack + option badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[0.65rem] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                          {item.pack.size}
                        </span>
                        {item.option && (
                          <span className="text-[0.65rem] font-semibold bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
                            {item.option}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => updateQty(item._key, item.qty - 1)}
                        className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 font-bold text-sm flex items-center justify-center border-0 cursor-pointer">−</button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item._key, item.qty + 1)}
                        className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 font-bold text-sm flex items-center justify-center border-0 cursor-pointer">+</button>
                    </div>

                    <button onClick={() => removeFromCart(item._key)}
                      className="text-stone-300 hover:text-red-500 text-xs transition-colors bg-transparent border-0 cursor-pointer mt-0.5">✕</button>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-xs text-stone-400">₹{item.pack.price.toLocaleString('en-IN')} × {item.qty}</span>
                    <span className="text-sm font-bold text-orange-700">₹{(item.pack.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="flex justify-between font-bold text-base">
                <span>Estimated Total</span>
                <span className="text-orange-700">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Final price confirmed by our team. May vary based on shade or availability.
              </p>
            </div>

            <Link href="/products" className="block text-center text-orange-700 hover:underline text-sm font-semibold mt-4 no-underline">
              + Add more products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[0.68rem] font-bold text-stone-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputCls(error = '') {
  return `w-full px-3 py-2.5 border rounded-lg text-sm text-stone-900 bg-stone-50 outline-none transition-colors ${
    error ? 'border-red-400' : 'border-stone-200 focus:border-orange-600 focus:bg-white'
  }`
}