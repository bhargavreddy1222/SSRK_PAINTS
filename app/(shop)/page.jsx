import Link from 'next/link'
import Image from 'next/image'
import { BRAND_INFO } from '@/lib/brands'
import { SHOP } from '@/lib/shop'
import {
  ArrowRightIcon, BrushIcon, ChatIcon, ClockIcon, DropletIcon, HomeIcon, InstagramIcon, LayersIcon,
  MapPinIcon, PaletteIcon, PhoneIcon, ShieldIcon, TruckIcon, WallIcon, WrenchIcon,
} from '@/components/Icons'

// `category` links into the catalogue with that filter applied
const PRODUCTS = [
  { Icon: BrushIcon,   name: 'Interior Wall Paints',   category: 'Interior',    desc: 'Emulsions and distempers in matte and silky finishes.' },
  { Icon: HomeIcon,    name: 'Exterior Paints',        category: 'Exterior',    desc: 'Weatherproof coatings for rain, sun, and humidity.' },
  { Icon: DropletIcon, name: 'Wood Polish & Finishes', category: 'Wood Finish', desc: 'NC lacquer, PU polish, and wood stains for all wooden surfaces.' },
  { Icon: WallIcon,    name: 'Wall Putty & Wall Care', category: 'Wall Putty',  desc: 'JK and Birla putty for smooth wall preparation.' },
  { Icon: LayersIcon,  name: 'Primers & Undercoats',   category: 'Primer',      desc: 'Wall primers for proper paint adhesion.' },
  { Icon: WrenchIcon,  name: 'Hardware & Accessories', category: null,          desc: 'Brushes, rollers, masking tape, thinner, and more — ask us in store.' },
]

const PERKS = [
  { Icon: ShieldIcon,  title: 'Genuine products',    desc: 'Sourced directly from the brands we stock.' },
  { Icon: PaletteIcon, title: 'Shade guidance',      desc: 'Help choosing the right base, finish and colour.' },
  { Icon: TruckIcon,   title: 'Bulk orders',         desc: 'Call ahead and we’ll have everything ready.' },
  { Icon: ChatIcon,    title: 'Order on WhatsApp',   desc: 'Send your list, we confirm price and stock.' },
]

const HERO_IMAGES = [
  { src: '/image/asian/royale-luxury.jpg', alt: 'Asian Paints Royale Luxury Emulsion' },
  { src: '/image/asian/ultima_protek.jpg', alt: 'Asian Paints Ultima Protek' },
  { src: '/image/asian/apex-exterior.jpg', alt: 'Asian Paints Apex' },
  { src: '/image/asian/royale-glitz.jpg',  alt: 'Asian Paints Royale Glitz' },
]

// Business details for Google (name, address, phone, hours)
const LOCAL_BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'HardwareStore',
  name: `${SHOP.name} ${SHOP.tagline}`,
  url: SHOP.url,
  image: `${SHOP.url}/opengraph-image`,
  telephone: SHOP.phoneE164,
  hasMap: SHOP.mapsHref,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SHOP.addressLine,
    addressLocality: SHOP.locality,
    addressRegion: SHOP.region,
    postalCode: SHOP.postalCode,
    addressCountry: 'IN',
  },
  openingHoursSpecification: SHOP.hours.map(({ dayOfWeek, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek,
    opens,
    closes,
  })),
}

export const metadata = {
  alternates: { canonical: '/' },
}

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="text-orange-700 text-xs font-bold uppercase tracking-widest mb-2">{eyebrow}</p>
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-balance">{title}</h2>
      {children && <p className="text-stone-500 text-sm leading-relaxed mt-3">{children}</p>}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS).replace(/</g, '\\u003c') }}
      />

      {/* ── HERO ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 to-white border-b border-stone-200">
        <div className="px-[5%] py-14 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-semibold mb-6 shadow-sm">
              <MapPinIcon className="w-3.5 h-3.5" /> Paints &amp; Hardware · Guntur, AP
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Colours that <span className="text-orange-700">last</span>,<br className="hidden sm:block" />
              {' '}from brands you trust.
            </h1>

            <p className="text-base text-stone-600 mt-5 mb-8 max-w-lg leading-relaxed">
              {SHOP.name} {SHOP.tagline} — your local shop for paints, putty, wood polish
              and hardware. Pick your products online and we&apos;ll confirm by phone or WhatsApp.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors no-underline">
                Browse Products <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a href={SHOP.phoneHref} className="flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 px-6 py-3.5 rounded-xl font-bold text-sm transition-colors no-underline">
                <PhoneIcon className="w-4 h-4 text-orange-700" /> Call Us
              </a>
              <a href={SHOP.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-colors no-underline">
                <ChatIcon className="w-4 h-4" /> WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4 text-orange-600" /> Open all week</span>
              <span className="flex items-center gap-1.5"><ShieldIcon className="w-4 h-4 text-orange-600" /> {BRAND_INFO.length} trusted brands</span>
            </div>
          </div>

          {/* Product collage */}
          <div className="relative hidden sm:block">
            <div className="absolute -inset-6 bg-orange-100/60 rounded-[2rem] rotate-2" aria-hidden="true" />
            <div className="relative grid grid-cols-2 gap-4">
              {HERO_IMAGES.map((img, i) => (
                <div
                  key={img.src}
                  className={`relative aspect-square bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden ${i % 2 ? 'translate-y-6' : ''}`}
                >
                  {/* Not preloaded: this collage is hidden on phones, which would download it for nothing */}
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain p-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paint stripe */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#C2410C 0% 20%,#D97706 20% 40%,#16A34A 40% 60%,#2563EB 60% 80%,#7C3AED 80% 100%)' }} />
      </section>

      {/* ── PERKS ──────────────────────────────── */}
      <section className="bg-white px-[5%] py-10 border-b border-stone-200">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHAT WE SELL ───────────────────────── */}
      <section className="px-[5%] py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="What We Sell" title="Paints, putty & hardware — all under one roof" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRODUCTS.map(({ Icon, name, desc, category }) => {
              const inner = (
                <>
                  <span className="w-12 h-12 rounded-xl bg-stone-100 group-hover:bg-orange-100 text-stone-700 group-hover:text-orange-700 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="font-bold text-base mb-1.5 flex items-center gap-1.5">
                    {name}
                    {category && <ArrowRightIcon className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-700" />}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                </>
              )
              const cls = 'group block bg-white border border-stone-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-200 no-underline text-stone-900'
              return category ? (
                <Link key={name} href={`/products?category=${encodeURIComponent(category)}`} className={cls}>{inner}</Link>
              ) : (
                <a key={name} href="#contact" className={cls}>{inner}</a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── BRANDS ─────────────────────────────── */}
      <section className="bg-white border-y border-stone-200 px-[5%] py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Brands We Stock" title="Products from brands you can trust" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRAND_INFO.map(b => (
              <Link
                key={b.name}
                href={`/products?brand=${encodeURIComponent(b.name)}`}
                className="group flex items-start gap-4 bg-stone-50 hover:bg-white rounded-2xl p-5 border border-transparent hover:border-stone-200 hover:shadow-md transition-all duration-200 no-underline text-stone-900"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${b.bg} ${b.text}`}>
                  {b.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">{b.name}</h3>
                    {b.badge && (
                      <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${b.bg} ${b.text}`}>
                        {b.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────── */}
      <section id="contact" className="px-[5%] py-16 md:py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-10 flex flex-col">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Find Us</p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Come visit or give us a call</h2>
            <p className="text-stone-400 text-sm leading-relaxed mb-8">
              Open all week. For bulk orders, call ahead and we&apos;ll have everything ready for you.
            </p>

            <dl className="flex flex-col gap-5 mb-8">
              <ContactRow Icon={MapPinIcon} label="Address">
                {SHOP.addressLine},<br />{SHOP.city}
              </ContactRow>
              <ContactRow Icon={PhoneIcon} label="Phone">
                <a href={SHOP.phoneHref} className="hover:text-orange-300 transition-colors">{SHOP.phoneDisplay}</a>
              </ContactRow>
              <ContactRow Icon={ClockIcon} label="Shop Hours">
                {SHOP.hours.map(h => <span key={h.days} className="block">{h.days}: {h.time}</span>)}
              </ContactRow>
            </dl>

            <div className="flex flex-wrap gap-3 mt-auto">
              <a href={SHOP.phoneHref} className="flex items-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
                <PhoneIcon className="w-4 h-4" /> Call Now
              </a>
              <a href={SHOP.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
                <ChatIcon className="w-4 h-4" /> WhatsApp
              </a>
              {SHOP.instagramHref && (
                <a href={SHOP.instagramHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gradient-to-tr from-amber-600 via-pink-700 to-purple-700 hover:opacity-90 text-white px-5 py-3 rounded-xl font-bold text-sm transition-opacity no-underline">
                  <InstagramIcon className="w-4 h-4" /> Instagram
                </a>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="flex flex-col gap-2 min-h-80">
            <iframe
              title="Shop location on Google Maps"
              src={SHOP.mapsEmbed}
              className="w-full flex-1 min-h-80 rounded-3xl border border-stone-200 bg-stone-200"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={SHOP.mapsHref} target="_blank" rel="noreferrer" className="self-end flex items-center gap-1 text-orange-700 font-bold text-xs hover:underline">
              Open in Google Maps <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactRow({ Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-10 h-10 rounded-xl bg-white/10 text-orange-300 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <dt className="text-[0.7rem] font-bold text-stone-400 uppercase tracking-wider mb-0.5">{label}</dt>
        <dd className="text-stone-100 m-0">{children}</dd>
      </div>
    </div>
  )
}
