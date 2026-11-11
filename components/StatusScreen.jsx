import { SHOP } from '@/lib/shop'
import { ChatIcon, PhoneIcon } from '@/components/Icons'

// Full-page message for "not found" and "something went wrong", with a way
// to reach the shop so the customer is never left at a dead end.
export default function StatusScreen({ eyebrow, title, children, actions }) {
  return (
    <div className="min-h-[70vh] bg-stone-50 flex items-center justify-center px-[5%] py-16">
      <div className="text-center max-w-md">
        <span className="grid grid-cols-2 gap-0.5 w-12 h-12 rounded-xl overflow-hidden mx-auto mb-6" aria-hidden="true">
          <span className="bg-orange-600" />
          <span className="bg-amber-400" />
          <span className="bg-sky-600" />
          <span className="bg-emerald-600" />
        </span>
        <p className="text-orange-700 text-xs font-bold uppercase tracking-widest mb-2">{eyebrow}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">{title}</h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-7">{children}</p>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-3">{actions}</div>

        <p className="text-stone-600 text-sm mt-8 mb-3">Or talk to us directly:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={SHOP.phoneHref} className="flex items-center gap-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-900 px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            <PhoneIcon className="w-4 h-4 text-orange-700" /> {SHOP.phoneDisplay}
          </a>
          <a href={SHOP.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors no-underline">
            <ChatIcon className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export const primaryAction = 'flex items-center justify-center gap-2 bg-orange-700 hover:bg-orange-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline border-0 cursor-pointer'
export const secondaryAction = 'flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors no-underline border-0 cursor-pointer'
