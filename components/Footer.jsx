import Link from 'next/link'
import { SHOP, BRANDS } from '@/lib/shop'
import { ChatIcon, ClockIcon, InstagramIcon, MapPinIcon, PhoneIcon } from '@/components/Icons'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 px-[5%] pt-14 pb-28 lg:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10 pb-10 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="text-lg font-extrabold text-white">
              Sri Sai <span className="text-orange-500">Ramakrishna</span>
            </div>
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-widest mb-4">
              {SHOP.tagline} · Guntur, AP
            </div>
            <p className="text-sm leading-relaxed max-w-sm mb-5">
              Your trusted local paint and hardware shop. Genuine products at fair prices.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BRANDS.map(b => (
                <span key={b} className="bg-white/5 border border-white/10 text-stone-300 px-2.5 py-1 rounded-full text-[0.68rem] font-semibold">{b}</span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 list-none p-0 m-0">
              {[['/', 'Home'], ['/products', 'Products'], ['/order', 'My Order'], ['/#contact', 'Contact']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-orange-400 transition-colors no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Contact</h4>
            <ul className="space-y-3 list-none p-0 m-0 text-sm">
              <li>
                <a href={SHOP.phoneHref} className="flex items-center gap-2 hover:text-orange-400 transition-colors no-underline">
                  <PhoneIcon className="w-4 h-4 text-orange-500 shrink-0" /> {SHOP.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={SHOP.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-400 transition-colors no-underline">
                  <ChatIcon className="w-4 h-4 text-orange-500 shrink-0" /> WhatsApp Us
                </a>
              </li>
              <li>
                <a href={SHOP.instagramHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-orange-400 transition-colors no-underline">
                  <InstagramIcon className="w-4 h-4 text-orange-500 shrink-0" /> {SHOP.instagramHandle}
                </a>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{SHOP.addressLine},<br />{SHOP.city}</span>
              </li>
              <li className="flex items-start gap-2">
                <ClockIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{SHOP.hours.map(h => <span key={h.days} className="block">{h.days}: {h.time}</span>)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-stone-500">
          <span>© {new Date().getFullYear()} Sri Sai Ramakrishna Paints &amp; Hardware. All rights reserved.</span>
          <span>Guntur, Andhra Pradesh</span>
        </div>
      </div>
    </footer>
  )
}
