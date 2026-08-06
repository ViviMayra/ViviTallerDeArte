'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type {CartItem} from './types'

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'vivi-cart'

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [...prev, item]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((v) => !v),
      addItem,
      removeItem,
      clear,
      total: items.reduce((sum, item) => sum + item.price, 0),
      count: items.length,
    }),
    [items, isOpen, addItem, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function buildWhatsAppCheckoutUrl(
  whatsapp: string,
  items: CartItem[],
  locale: 'es' | 'en',
): string {
  const phone = whatsapp.replace(/\D/g, '')
  const lines =
    locale === 'es'
      ? [
          'Hola, estoy interesada/o en estas piezas de VIVI Taller de Arte:',
          '',
          ...items.map(
            (item, i) =>
              `${i + 1}. ${item.title} — S/ ${item.price} (${item.slug})`,
          ),
          '',
          `Total: S/ ${items.reduce((s, i) => s + i.price, 0)}`,
          '',
          '¿Están disponibles?',
        ]
      : [
          'Hi, I’m interested in these pieces from VIVI Taller de Arte:',
          '',
          ...items.map(
            (item, i) =>
              `${i + 1}. ${item.title} — S/ ${item.price} (${item.slug})`,
          ),
          '',
          `Total: S/ ${items.reduce((s, i) => s + i.price, 0)}`,
          '',
          'Are they available?',
        ]

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}
