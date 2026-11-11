'use client'

import { useEffect } from 'react'
import StatusScreen, { primaryAction, secondaryAction } from '@/components/StatusScreen'

// Shown when a page fails to load — most often because the product list
// can't be read. The shop can still take the order by phone.
export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <StatusScreen
      eyebrow="Something went wrong"
      title="We can’t show this page right now"
      actions={
        <>
          <button type="button" onClick={() => reset()} className={primaryAction}>Try again</button>
          {/* A full page load, in case the app itself is what broke */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={secondaryAction}>Go to home page</a>
        </>
      }
    >
      It’s a problem on our side, not yours. Please try again in a minute — or call or WhatsApp us and we’ll take your order directly.
    </StatusScreen>
  )
}
