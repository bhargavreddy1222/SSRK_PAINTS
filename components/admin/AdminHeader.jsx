'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { href: '/admin',          label: 'Orders'   },
  { href: '/admin/products', label: 'Products' },
]

// Top bar shared by all admin pages; `actions` renders extra buttons on the right
export default function AdminHeader({ actions }) {
  const router = useRouter()
  const pathname = usePathname()

  async function logout() {
    await fetch('/api/admin/session', { method: 'DELETE' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-stone-200 px-4 md:px-8 h-16 flex items-center gap-4 sticky top-0 z-30">
      <span className="grid grid-cols-2 gap-0.5 w-8 h-8 rounded-lg overflow-hidden shrink-0" aria-hidden="true">
        <span className="bg-orange-600" /><span className="bg-amber-400" />
        <span className="bg-sky-600" /><span className="bg-emerald-600" />
      </span>

      <nav className="flex gap-1">
        {TABS.map(tab => {
          const active = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-bold no-underline transition-colors ${
                active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <Link href="/" target="_blank" className="hidden sm:block px-3 py-2 rounded-lg text-sm font-semibold text-stone-600 hover:bg-stone-100 no-underline">
          View shop
        </Link>
        <button onClick={logout} className="px-3.5 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-sm font-semibold cursor-pointer">
          Log out
        </button>
      </div>
    </header>
  )
}
