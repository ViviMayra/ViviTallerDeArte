'use client'

import {useLocale, useTranslations} from 'next-intl'
import {buildWhatsAppCheckoutUrl, useCart} from '@/lib/cart'
import {formatPrice} from '@/lib/locale'

export function CartDrawer({whatsapp}: {whatsapp: string}) {
  const {items, isOpen, closeCart, removeItem, total} = useCart()
  const t = useTranslations('cart')
  const common = useTranslations('common')
  const locale = useLocale() as 'es' | 'en'

  if (!isOpen) return null

  const checkoutUrl =
    items.length > 0
      ? buildWhatsAppCheckoutUrl(whatsapp, items, locale)
      : undefined

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/30"
        aria-label={t('close')}
        onClick={closeCart}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-xl animate-fade-up">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-wide">
            {t('title')}
          </h2>
          <button type="button" onClick={closeCart} className="text-sm text-muted">
            {t('close')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted">{common('emptyCart')}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-line pb-4">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-20 w-20 object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-line" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {formatPrice(item.price, locale)}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs uppercase tracking-[0.12em] text-muted hover:text-foreground"
                      onClick={() => removeItem(item.id)}
                    >
                      {common('remove')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4">
          <div className="mb-4 flex justify-between text-sm">
            <span>{common('total')}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
          {checkoutUrl ? (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-foreground px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-background transition hover:bg-ochre-deep"
            >
              {common('checkoutWhatsApp')}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="block w-full bg-line px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted"
            >
              {common('checkoutWhatsApp')}
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
