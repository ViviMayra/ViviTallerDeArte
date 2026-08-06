'use client'

import {useTranslations} from 'next-intl'

export function ShareButton() {
  const common = useTranslations('common')

  return (
    <button
      type="button"
      className="mt-6 text-[11px] tracking-wide text-muted underline-offset-2 hover:underline"
      onClick={async () => {
        const url = window.location.href
        if (navigator.share) {
          try {
            await navigator.share({url})
            return
          } catch {
            /* fall through */
          }
        }
        await navigator.clipboard.writeText(url)
      }}
    >
      {common('share')}
    </button>
  )
}
