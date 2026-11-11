'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ORDER_STATUSES, orderRef } from '@/lib/orderStatus'
import { ChatIcon, PhoneIcon, SearchIcon } from '@/components/Icons'
import AdminHeader from '@/components/admin/AdminHeader'

const STATUS_BY_ID = Object.fromEntries(ORDER_STATUSES.map(s => [s.id, s]))
// The main button on each order moves it one step along this path
const NEXT_STEP = { new: 'confirmed', confirmed: 'ready', ready: 'completed' }
const OPEN_STATUSES = ['new', 'confirmed', 'ready']

const rupees = n => `₹${Number(n ?? 0).toLocaleString('en-IN')}`
const istDate = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' })
const istDateTime = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })

export default function OrdersBoard({ orders, loadError, statusMissing, limit }) {
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()
  const [tab,    setTab]    = useState('open')
  const [search, setSearch] = useState('')
  // Local status changes, applied on top of the server data
  const [statusOverrides, setStatusOverrides] = useState({})
  const [saving,  setSaving]  = useState(null)
  const [saveErr, setSaveErr] = useState('')

  const list = useMemo(
    () => orders.map(o => ({ ...o, status: statusOverrides[o.id] ?? o.status })),
    [orders, statusOverrides]
  )

  const counts = useMemo(() => {
    const c = { open: 0, all: list.length }
    for (const o of list) {
      c[o.status] = (c[o.status] ?? 0) + 1
      if (OPEN_STATUSES.includes(o.status)) c.open++
    }
    return c
  }, [list])

  const today = istDate.format(new Date())
  const todayCount = list.filter(o => istDate.format(new Date(o.placed_at)) === today).length
  const openValue  = list.filter(o => OPEN_STATUSES.includes(o.status)).reduce((sum, o) => sum + Number(o.estimated_total ?? 0), 0)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return list.filter(o => {
      const matchTab =
        tab === 'all'  ? true :
        tab === 'open' ? OPEN_STATUSES.includes(o.status) :
        o.status === tab
      const matchSearch = !q || [o.customer_name, o.phone, o.email, String(o.id)]
        .some(v => v?.toLowerCase().includes(q))
      return matchTab && matchSearch
    })
  }, [list, tab, search])

  async function setStatus(order, status) {
    const previous = order.status
    setSaving(order.id)
    setSaveErr('')
    setStatusOverrides(s => ({ ...s, [order.id]: status }))
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.status === 401) { router.replace('/admin/login'); return }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Update failed')
      }
    } catch (err) {
      setStatusOverrides(s => ({ ...s, [order.id]: previous }))
      setSaveErr(`Order #${orderRef(order.id)}: ${err.message}`)
    } finally {
      setSaving(null)
    }
  }

  const tabs = [
    { id: 'open', label: 'Open' },
    ...ORDER_STATUSES.map(s => ({ id: s.id, label: s.label })),
    { id: 'all', label: 'All' },
  ]

  return (
    <div className="pb-16">
      <AdminHeader
        actions={
          <button
            onClick={() => startRefresh(() => router.refresh())}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold border-0 cursor-pointer disabled:opacity-60"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
        {loadError && <Banner tone="red">{loadError}</Banner>}
        {statusMissing && (
          <Banner tone="amber">
            Order statuses won&apos;t save until you add a <code className="font-mono">status</code> column.
            Run this once in the Supabase SQL editor:
            <pre className="mt-2 bg-white/70 rounded-lg p-3 text-xs overflow-x-auto">alter table orders add column status text not null default &apos;new&apos;;</pre>
          </Banner>
        )}
        {saveErr && <Banner tone="red">{saveErr}</Banner>}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Stat label="New orders" value={counts.new ?? 0} highlight={(counts.new ?? 0) > 0} />
          <Stat label="Placed today" value={todayCount} />
          <Stat label="Open orders" value={counts.open} />
          <Stat label="Open order value" value={rupees(openValue)} />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
                  tab === t.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-xs ${tab === t.id ? 'text-stone-300' : 'text-stone-400'}`}>{counts[t.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="relative md:ml-auto md:w-72">
            <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, phone, email or order #"
              aria-label="Search orders"
              className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-sm bg-white outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Orders */}
        {visible.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-stone-300 rounded-2xl text-stone-500 text-sm">
            No orders here.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {visible.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                saving={saving === order.id}
                onStatus={status => setStatus(order, status)}
              />
            ))}
          </div>
        )}

        {orders.length >= limit && (
          <p className="text-xs text-stone-400 text-center mt-6">Showing the latest {limit} orders.</p>
        )}
      </div>
    </div>
  )
}

function OrderCard({ order, saving, onStatus }) {
  const status = STATUS_BY_ID[order.status] ?? STATUS_BY_ID.new
  const next = NEXT_STEP[order.status]
  const items = Array.isArray(order.items) ? order.items : []
  const waText = encodeURIComponent(
    `Hi ${order.customer_name}, this is Sri Sai Ramakrishna Paints & Hardware about your order #${orderRef(order.id)} (${rupees(order.estimated_total)}).`
  )

  return (
    <article className={`bg-white border rounded-2xl overflow-hidden ${order.status === 'new' ? 'border-orange-300 shadow-sm' : 'border-stone-200'}`}>
      {/* Top: customer + status */}
      <div className="p-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-stone-400">#{orderRef(order.id)}</span>
            <span className={`text-[0.65rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${status.badge}`}>
              {status.label}
            </span>
          </div>
          <h3 className="font-bold text-base truncate">{order.customer_name}</h3>
          <p className="text-xs text-stone-400">{istDateTime.format(new Date(order.placed_at))}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-extrabold text-lg tabular-nums">{rupees(order.estimated_total)}</p>
          <p className="text-xs text-stone-400">{order.total_items} item{order.total_items !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="px-5 pb-4 flex flex-wrap gap-2 text-sm">
        <a href={`tel:+91${order.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 font-semibold no-underline text-stone-800">
          <PhoneIcon className="w-3.5 h-3.5" /> {order.phone}
        </a>
        <a href={`https://wa.me/91${order.phone}?text=${waText}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-green-800 font-semibold no-underline">
          <ChatIcon className="w-3.5 h-3.5" /> WhatsApp
        </a>
        {order.email && (
          <a href={`mailto:${order.email}`} className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 font-medium text-stone-600 no-underline truncate max-w-full">
            {order.email}
          </a>
        )}
      </div>

      {/* Items */}
      <ul className="border-t border-stone-100 divide-y divide-stone-100 list-none m-0 p-0">
        {items.map((item, i) => (
          <li key={i} className="px-5 py-2.5 flex items-center gap-3 text-sm">
            <span className="w-8 text-center font-bold text-stone-500 tabular-nums shrink-0">{item.qty}×</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.product}</p>
              <p className="text-xs text-stone-400 truncate">
                {item.brand} · {item.pack}{item.option ? ` · ${item.option}` : ''} · {rupees(item.price)} each
              </p>
            </div>
            <span className="font-semibold tabular-nums shrink-0">{rupees(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="mx-5 mt-3 text-sm bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-amber-900">
          <span className="font-semibold">Note:</span> {order.notes}
        </p>
      )}

      {/* Actions */}
      <div className="p-5 pt-4 flex items-center gap-2">
        {next && (
          <button
            onClick={() => onStatus(next)}
            disabled={saving}
            className="flex-1 bg-orange-700 hover:bg-orange-800 disabled:bg-stone-400 text-white font-bold text-sm py-2.5 rounded-xl border-0 cursor-pointer transition-colors"
          >
            Mark as {STATUS_BY_ID[next].label}
          </button>
        )}
        <select
          value={order.status}
          onChange={e => onStatus(e.target.value)}
          disabled={saving}
          aria-label="Change status"
          className={`${next ? '' : 'flex-1'} px-3 py-2.5 border border-stone-200 rounded-xl text-sm font-semibold bg-white cursor-pointer outline-none focus:border-orange-500`}
        >
          {ORDER_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
    </article>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-orange-700 border-orange-700 text-white' : 'bg-white border-stone-200'}`}>
      <p className={`text-xs font-semibold ${highlight ? 'text-orange-100' : 'text-stone-500'}`}>{label}</p>
      <p className="text-2xl font-extrabold tabular-nums mt-1">{value}</p>
    </div>
  )
}

function Banner({ tone, children }) {
  const cls = tone === 'red'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-amber-50 border-amber-200 text-amber-900'
  return <div className={`border rounded-2xl p-4 text-sm mb-5 ${cls}`}>{children}</div>
}
