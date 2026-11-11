import Link from 'next/link'
import StatusScreen, { primaryAction, secondaryAction } from '@/components/StatusScreen'

export const metadata = {
  title: 'Page not found — Sri Sai Ramakrishna Paints & Hardware',
}

export default function NotFound() {
  return (
    <StatusScreen
      eyebrow="Page not found"
      title="We couldn’t find that page"
      actions={
        <>
          <Link href="/products" className={primaryAction}>Browse products</Link>
          <Link href="/" className={secondaryAction}>Go to home page</Link>
        </>
      }
    >
      The link may be old, or the product may no longer be on our list.
    </StatusScreen>
  )
}
