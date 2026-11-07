// Order workflow used by the admin page (stored in orders.status)
export const ORDER_STATUSES = [
  { id: 'new',       label: 'New',       badge: 'bg-orange-100 text-orange-800' },
  { id: 'confirmed', label: 'Confirmed', badge: 'bg-blue-100 text-blue-800'     },
  { id: 'ready',     label: 'Ready',     badge: 'bg-violet-100 text-violet-800' },
  { id: 'completed', label: 'Completed', badge: 'bg-green-100 text-green-800'   },
  { id: 'cancelled', label: 'Cancelled', badge: 'bg-stone-200 text-stone-600'   },
]

export const DEFAULT_STATUS = 'new'

// Short order number shown to customers and in admin (orders.id is a long UUID)
export const orderRef = id => String(id).slice(0, 8).toUpperCase()
