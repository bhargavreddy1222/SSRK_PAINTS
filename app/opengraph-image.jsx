import { ImageResponse } from 'next/og'
import { SHOP } from '@/lib/shop'

// The preview picture shown when the site link is shared on WhatsApp etc.
export const alt = 'Sri Sai Ramakrishna Paints & Hardware, Guntur'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STRIPE = ['#C2410C', '#D97706', '#16A34A', '#2563EB', '#7C3AED']

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#FFF7ED' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
        <div style={{ fontSize: 76, fontWeight: 800, color: '#1C1917' }}>{SHOP.name}</div>
        <div style={{ fontSize: 44, fontWeight: 700, color: '#C2410C', marginTop: 12 }}>{SHOP.tagline}</div>
        <div style={{ fontSize: 32, color: '#57534E', marginTop: 36 }}>{`${SHOP.addressLine}, ${SHOP.locality}`}</div>
        <div style={{ fontSize: 32, color: '#57534E', marginTop: 8 }}>{SHOP.phoneDisplay}</div>
      </div>
      <div style={{ display: 'flex', height: 24 }}>
        {STRIPE.map(color => <div key={color} style={{ flex: 1, background: color }} />)}
      </div>
    </div>,
    size
  )
}
