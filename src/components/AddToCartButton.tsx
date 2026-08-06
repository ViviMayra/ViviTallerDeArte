'use client'

import {useTranslations} from 'next-intl'
import {useCart} from '@/lib/cart'
import type {CartItem} from '@/lib/types'

export function AddToCartButton({
  item,
  sold,
}: {
  item: CartItem
  sold?: boolean
}) {
  const {addItem, items} = useCart()
  const common = useTranslations('common')
  const inCart = items.some((i) => i.id === item.id)

  if (sold) {
    return (
      <button
        type="button"
        disabled
        className="w-full max-w-xs cursor-not-allowed bg-sold px-6 py-3 text-xs uppercase tracking-[0.16em] text-background"
      >
        {common('sold')}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className="w-full max-w-xs bg-foreground px-6 py-3 text-xs uppercase tracking-[0.16em] text-background transition hover:bg-ochre-deep"
    >
      {inCart ? common('inCart') : common('addToCart')}
    </button>
  )
}
