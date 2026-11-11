'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon, BagIcon, ChatIcon, CheckIcon, MinusIcon, PaletteIcon, PlusIcon, TrashIcon } from '@/components/Icons'
import { useCart } from '@/context/CartContext'
import { orderRef } from '@/lib/orderStatus'
import { SHOP } from '@/lib/shop'

// Pre-filled WhatsApp message so the customer can send the order in one tap
function whatsappLink(ref, name, cart, total) {
  const text = [
    `Hi, this is ${name}. I placed order #${ref}:`,
    ...cart.map(i => `- ${i.name} (${i.brand}), ${i.pack.size}${i.option ? `, ${i.option}` : ''} x ${i.qty}`),
    `Estimated total: ₹${total.toLocaleString('en-IN')}`,
  ].join('\n')
  return `${SHOP.whatsappHref}?text=${encodeURIComponent(text)}`
}

export default function OrderPage() {
  const { cart, loaded, updateQty, removeFromCart, clearCart, totalItems, totalPrice } = useCart()
  const [form,   setForm]   = useState({ name: '', phone: '', email: '', notes: '' })
  const [status, setStatus] = useState('idle')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  // Kept for the success screen, because the cart is cleared by then
  const [placed, setPlaced] = useState(null)

  function validate() {
    const errs = {}
    if (!form.name.trim())                 errs.name  = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone))  errs.phone = 'Enter a valid 10-digit mobile number'
    if (form.email.trim() && !/^[^\s@<>"'(),:;?&]+@[^\s@<>"'(),:;?&]+\.[^\s@<>"'(),:;?&]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address'
    return errs
  }

  async function handleSubmit() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (cart.length === 0) { alert('Your order is empty.'); return }

    setStatus('submitting')
    setErrors({})

    // Only identifiers + qty are sent — the server looks up prices itself
    const payload = {
      customer: form,
      items: cart.map(i => ({
        productId: i.id,
        pack:      i.pack.size,
        option:    i.option,
        qty:       i.qty,
      })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error)

      const ref = orderRef(data.orderId)
      setPlaced({ ref, whatsapp: whatsappLink(ref, form.name.trim(), cart, totalPrice) })
      setStatus('success')
      clearCart()
    } catch (err) {
      setSubmitError(err.message || '')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-[5%] py-20">
        <div className="text-center max-w-md bg-white border border-stone-200 rounded-3xl p-10 shadow-sm">
          <span className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-5">
            <CheckIcon className="w-8 h-8" />
          </span>
          <h2 className="text-2xl font-extrabold mb-2">Order Received!</h2>
          <p className="text-sm font-bold text-stone-800 mb-3">Order number: #{placed.ref}</p>
          <p className="text-stone-500 text-sm leading-relaxed mb-7">
            Thanks <strong className="text-stone-800">{form.name}</strong>! We&apos;ll confirm your order on{' '}
            <strong className="text-stone-800">{form.phone}</strong>
            {form.email.trim() && <> and send details to <strong className="text-stone-800">{form.email.trim()}</strong></>}.
          </p>
          <div className="flex flex-col gap-3">
            <a href={placed.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
              <ChatIcon className="w-4 h-4" /> Send Order on WhatsApp
            </a>
            <Link href="/products" className="flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
              Browse More Products <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Wait for the saved cart to load so "empty" doesn't flash
  if (!loaded) return <div className="min-h-[70vh] bg-stone-50" />

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-[5%] py-20">
        <div className="text-center max-w-sm">
          <span className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-5">
            <BagIcon className="w-8 h-8" />
          </span>
          <h2 className="text-xl font-extrabold mb-2">Your order is empty</h2>
          <p className="text-stone-500 text-sm mb-6">Add products from the catalogue first.</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            Go to Products <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 px-[5%] py-10">
      <div className="max-w-6xl mx-auto">

        <p className="text-orange-700 text-xs font-bold uppercase tracking-widest mb-2">Checkout</p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8">Place Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 lg:gap-8 items-start">

          {/* ── Customer form ──────────────────── */}
          <form
            noValidate
            onSubmit={e => { e.preventDefault(); handleSubmit() }}
            className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 order-2 lg:order-1"
          >
            <h2 className="text-lg font-bold mb-1">Your Details</h2>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              We&apos;ll call or WhatsApp you on this number to confirm the order and pricing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <div className="sm:col-span-2">
                <Field label="Full Name" error={errors.name}>
                  <input type="text" autoComplete="name" placeholder="Your name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className={inputCls(errors.name)} />
                </Field>
              </div>

              <Field label="Mobile Number" error={errors.phone}>
                <input type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="10-digit mobile" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                  className={inputCls(errors.phone)} />
              </Field>

              <Field label="Email Address (optional)" error={errors.email}>
                <input type="email" autoComplete="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className={inputCls(errors.email)} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Special Instructions (optional)">
                  <textarea rows={3} placeholder="Specific shade, quantity notes, pickup time..."
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className={`${inputCls()} resize-y`} />
                </Field>
              </div>
            </div>

            {status === 'error' && (
              <p className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {submitError || 'Something went wrong.'} Please try again or call us directly.
              </p>
            )}

            <button type="submit" disabled={status === 'submitting'}
              className="w-full flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 disabled:bg-stone-400 text-white font-bold text-sm py-4 rounded-xl transition-colors cursor-pointer border-0">
              {status === 'submitting'
                ? 'Placing Order…'
                : <>Confirm Order · ₹{totalPrice.toLocaleString('en-IN')} <ArrowRightIcon className="w-4 h-4" /></>}
            </button>
            <p className="text-stone-400 text-xs text-center mt-3">
              No payment now — final pricing is confirmed by our team.
            </p>
          </form>

          {/* ── Order summary ───────────────────── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 lg:sticky lg:top-24 order-1 lg:order-2">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              Order Summary
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </h2>

            <ul className="flex flex-col list-none m-0 p-0 mb-5">
              {cart.map(item => (
                <li key={item._key} className="flex gap-3 py-3 border-b border-stone-100 last:border-0">
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 shrink-0 overflow-hidden">
                    {item.image
                      ? <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1" />
                      : <PaletteIcon className="w-6 h-6 text-stone-300 absolute inset-0 m-auto" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug">{item.name}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {item.brand} · {item.pack.size}{item.option ? ` · ${item.option}` : ''}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item._key)} aria-label={`Remove ${item.name}`}
                        className="p-1 -m-1 text-stone-300 hover:text-red-500 transition-colors bg-transparent border-0 cursor-pointer">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-stone-200 rounded-lg">
                        <button onClick={() => updateQty(item._key, item.qty - 1)} aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-l-lg bg-transparent border-0 cursor-pointer">
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-bold w-8 text-center tabular-nums">{item.qty}</span>
                        <button onClick={() => updateQty(item._key, item.qty + 1)} aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded-r-lg bg-transparent border-0 cursor-pointer">
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold tabular-nums">₹{(item.pack.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Total */}
            <div className="bg-stone-50 rounded-xl p-4">
              <div className="flex justify-between font-bold text-base">
                <span>Estimated Total</span>
                <span className="text-orange-700 tabular-nums">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
                Final price confirmed by our team. May vary based on shade or availability.
              </p>
            </div>

            <Link href="/products" className="flex items-center justify-center gap-1.5 text-orange-700 hover:text-orange-800 text-sm font-semibold mt-4 no-underline">
              <PlusIcon className="w-4 h-4" /> Add more products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold text-stone-600 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-red-600 text-xs mt-1">{error}</span>}
    </label>
  )
}

function inputCls(error = '') {
  return `w-full px-3.5 py-3 border rounded-xl text-sm text-stone-900 bg-stone-50 outline-none transition focus:bg-white focus:ring-4 ${
    error ? 'border-red-400 focus:ring-red-100' : 'border-stone-200 focus:border-orange-500 focus:ring-orange-100'
  }`
}
