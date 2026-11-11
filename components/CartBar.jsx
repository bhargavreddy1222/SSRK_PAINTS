'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { ArrowRightIcon, BagIcon } from '@/components/Icons'

// Floating "view order" bar on phones once something is in the cart
export default function CartBar() {
  const { totalItems, totalPrice } = useCart()
  const pathname = usePathname()

  if (!totalItems || pathname === '/order') return null

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Link
        href="/order"
        className="flex items-center gap-3 bg-stone-900 text-white rounded-2xl px-4 py-3 shadow-lg no-underline"
      >
        <span className="relative">
          <BagIcon className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-orange-600 text-[0.6rem] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        </span>
        <span className="flex-1 text-sm">
          <span className="font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
          <span className="text-stone-400"> · {totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </span>
        <span className="flex items-center gap-1 text-sm font-bold text-orange-300">
          View order <ArrowRightIcon className="w-4 h-4" />
        </span>
      </Link>
    </div>
  )
}
