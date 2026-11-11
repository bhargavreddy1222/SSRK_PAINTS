'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { SHOP } from '@/lib/shop'
import { BagIcon, ChatIcon, ClockIcon, CloseIcon, InstagramIcon, MapPinIcon, MenuIcon, PhoneIcon } from '@/components/Icons'

const NAV_LINKS = [
  { href: '/',         label: 'Home'     },
  { href: '/products', label: 'Products' },
  { href: '/#contact', label: 'Contact'  },
]

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline">
      {/* Paint-swatch mark */}
      <span className="grid grid-cols-2 gap-0.5 w-8 h-8 rounded-lg overflow-hidden shrink-0" aria-hidden="true">
        <span className="bg-orange-600" />
        <span className="bg-amber-400" />
        <span className="bg-sky-600" />
        <span className="bg-emerald-600" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.95rem] font-extrabold text-stone-900 tracking-tight">
          Sri Sai <span className="text-orange-700">Ramakrishna</span>
        </span>
        <span className="text-[0.62rem] text-stone-500 font-semibold uppercase tracking-widest">
          {SHOP.tagline}
        </span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { totalItems } = useCart()
  const pathname = usePathname()
  const menuButton = useRef(null)
  const menuPanel  = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // While the mobile menu is open: lock page scroll, close on Escape, and keep
  // keyboard focus inside the menu. Focus goes back to the menu button on close.
  useEffect(() => {
    if (!mobileOpen) return
    const panel = menuPanel.current
    const opener = menuButton.current
    const focusable = () => [...panel.querySelectorAll('a[href], button:not([disabled])')]

    function onKey(e) {
      if (e.key === 'Escape') { setMobileOpen(false); return }
      if (e.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last  = items.at(-1)
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      else if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus() }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    focusable()[0]?.focus()
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [mobileOpen])

  return (
    <>
      {/* Top bar (desktop only — too cramped on phones) */}
      <div className="hidden md:flex bg-stone-900 text-stone-300 px-[5%] py-2 justify-between items-center text-xs">
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="w-3.5 h-3.5 text-orange-400" />
          {SHOP.addressLine}, {SHOP.city}
        </span>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-orange-400" />
            {SHOP.hours.map(h => `${h.days}: ${h.time}`).join('  ·  ')}
          </span>
          {SHOP.instagramHref && (
            <a href={SHOP.instagramHref} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-orange-300 transition-colors">
              <InstagramIcon className="w-3.5 h-3.5" />
              Instagram
            </a>
          )}
          <a href={SHOP.phoneHref} className="flex items-center gap-1.5 font-semibold text-white hover:text-orange-300 transition-colors">
            <PhoneIcon className="w-3.5 h-3.5" />
            {SHOP.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav aria-label="Main" className={`bg-white/90 backdrop-blur border-b border-stone-200 px-[5%] flex items-center justify-between h-16 sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <Logo />

        {/* Desktop links */}
        <ul className="hidden lg:flex gap-1 list-none m-0 p-0">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors no-underline ${
                    active ? 'text-orange-700 bg-orange-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/order" className="relative flex items-center gap-2 border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-900 px-4 py-2 rounded-lg font-semibold text-sm transition-colors no-underline">
            <BagIcon className="w-4 h-4" />
            My Order
            {totalItems > 0 && (
              <span className="bg-orange-700 text-white text-[0.65rem] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <a href={SHOP.phoneHref} className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors no-underline">
            <PhoneIcon className="w-4 h-4" />
            Call Now
          </a>
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="lg:hidden flex items-center gap-1">
          <Link href="/order" className="relative p-2.5 text-stone-800" aria-label={`My order (${totalItems} items)`}>
            <BagIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-orange-700 text-white text-[0.6rem] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="p-2.5 text-stone-800 bg-transparent border-0 cursor-pointer"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-[200] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-stone-900/40" onClick={() => setMobileOpen(false)} />
          <div ref={menuPanel} className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl flex flex-col px-6 py-5 animate-slide-in">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-500" aria-hidden="true">Menu</span>
              <button type="button" onClick={() => setMobileOpen(false)} className="p-2.5 -mr-2.5 bg-transparent border-0 cursor-pointer text-stone-700" aria-label="Close menu">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            {[...NAV_LINKS, { href: '/order', label: `My Order${totalItems ? ` (${totalItems})` : ''}` }].map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === link.href ? 'page' : undefined}
                className={`text-lg font-bold py-3.5 border-b border-stone-100 no-underline transition-colors ${
                  pathname === link.href ? 'text-orange-700' : 'text-stone-900 hover:text-orange-700'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-auto flex flex-col gap-3">
              <a href={SHOP.phoneHref} className="flex items-center justify-center gap-2 bg-orange-700 text-white py-3.5 rounded-xl font-bold no-underline">
                <PhoneIcon className="w-5 h-5" /> Call {SHOP.phoneDisplay}
              </a>
              <a href={SHOP.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 rounded-xl font-bold no-underline">
                <ChatIcon className="w-5 h-5" /> WhatsApp Us
              </a>
              {SHOP.instagramHref && (
                <a href={SHOP.instagramHref} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 border border-stone-200 text-stone-900 py-3.5 rounded-xl font-bold no-underline">
                  <InstagramIcon className="w-5 h-5 text-pink-600" /> Follow on Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
