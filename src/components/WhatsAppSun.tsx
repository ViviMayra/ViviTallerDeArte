'use client'

import {useEffect, useId, useRef, useState} from 'react'
import {useTranslations} from 'next-intl'
import {usePathname} from '@/i18n/navigation'
import {useCart} from '@/lib/cart'

const HINT_VISIBLE_MS = 8000
const HINT_RESHOW_MS = 45000

type Props = {
  whatsapp: string
}

export function WhatsAppSun({whatsapp}: Props) {
  const t = useTranslations('whatsappSun')
  const pathname = usePathname()
  const {isOpen: cartOpen} = useCart()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [hintVisible, setHintVisible] = useState(true)
  const [hovered, setHovered] = useState(false)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const phone = whatsapp.replace(/\D/g, '')
  const showTeaser = !open && (hintVisible || hovered)

  // Brief teaser on each page, then again every ~45s while the chat is closed.
  useEffect(() => {
    if (open || cartOpen) {
      setHintVisible(false)
      return
    }

    let hideTimer = 0

    const showHint = () => {
      setHintVisible(true)
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(
        () => setHintVisible(false),
        HINT_VISIBLE_MS,
      )
    }

    showHint()
    const reshowTimer = window.setInterval(showHint, HINT_RESHOW_MS)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearInterval(reshowTimer)
    }
  }, [pathname, open, cartOpen])

  useEffect(() => {
    if (!open) return
    textareaRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [open])

  useEffect(() => {
    if (cartOpen) setOpen(false)
  }, [cartOpen])

  useEffect(() => {
    if (open) setHovered(false)
  }, [open])

  if (cartOpen) return null

  const send = () => {
    const trimmed = message.trim()
    const url = trimmed
      ? `https://wa.me/${phone}?text=${encodeURIComponent(trimmed)}`
      : `https://wa.me/${phone}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setMessage('')
    setOpen(false)
  }

  const sunButton = (
    <button
      type="button"
      className={`whatsapp-sun-button relative flex h-16 w-16 items-center justify-center rounded-full md:h-[4.5rem] md:w-[4.5rem] ${
        open ? 'whatsapp-sun-button--open' : ''
      }`}
      aria-expanded={open}
      aria-controls={open ? panelId : undefined}
      aria-label={open ? t('close') : t('open')}
      onClick={() => setOpen((value) => !value)}
    >
      <span className="whatsapp-sun-glow" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/sun-icon.png"
        alt=""
        width={72}
        height={72}
        className="whatsapp-sun-face relative z-[1] h-[3.35rem] w-[3.35rem] select-none drop-shadow-[0_6px_14px_rgba(168,132,61,0.28)] md:h-16 md:w-16"
        draggable={false}
      />
    </button>
  )

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3 md:bottom-8 md:right-8"
    >
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('title')}
          className="pointer-events-auto w-[min(calc(100vw-2rem),19rem)] origin-bottom-right animate-fade-up rounded-2xl border border-line bg-surface/95 p-4 shadow-[0_18px_40px_-20px_rgba(44,44,44,0.35)] backdrop-blur-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-base tracking-wide text-foreground">
                {t('title')}
              </p>
              <p className="mt-1 text-pretty text-xs leading-relaxed text-muted">
                {t('subtitle')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted hover:text-foreground"
              aria-label={t('close')}
            >
              {t('close')}
            </button>
          </div>

          <label className="sr-only" htmlFor={`${panelId}-message`}>
            {t('placeholder')}
          </label>
          <textarea
            id={`${panelId}-message`}
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                send()
              }
            }}
            placeholder={t('placeholder')}
            rows={4}
            className="w-full resize-none rounded-xl border border-line bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted/70 focus:border-ochre"
          />

          <button
            type="button"
            onClick={send}
            className="mt-3 w-full bg-foreground px-4 py-2.5 text-center text-[11px] uppercase tracking-[0.16em] text-background transition hover:bg-ochre-deep"
          >
            {t('send')}
          </button>
        </div>
      )}

      <div
        className="pointer-events-auto flex flex-col items-end gap-3"
        onMouseEnter={() => {
          if (!open) setHovered(true)
        }}
        onMouseLeave={() => setHovered(false)}
      >
        {showTeaser && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-live="polite"
            className="max-w-[14rem] animate-fade-up rounded-2xl rounded-br-md border border-line bg-surface/95 px-3.5 py-2.5 text-left text-pretty text-sm leading-snug text-foreground shadow-[0_12px_28px_-16px_rgba(44,44,44,0.35)] backdrop-blur-sm transition hover:border-ochre"
          >
            <span className="mb-0.5 block text-[11px] font-medium tracking-[0.12em] text-ochre-deep uppercase">
              {t('teaserLabel')}
            </span>
            {t('teaser')}
          </button>
        )}
        {sunButton}
      </div>
    </div>
  )
}
