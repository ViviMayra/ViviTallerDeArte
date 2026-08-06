'use client'

import Image from 'next/image'
import {useTranslations, useLocale} from 'next-intl'
import {useState} from 'react'
import {Link, usePathname} from '@/i18n/navigation'
import {useCart} from '@/lib/cart'
import type {SectionRef} from '@/lib/types'
import {t} from '@/lib/locale'

type Props = {
  joyeriaSections?: SectionRef[]
  ceramicaSections?: SectionRef[]
  ilustracionesSections?: SectionRef[]
  pinturaSections?: SectionRef[]
}

export function Header({
  joyeriaSections = [],
  ceramicaSections = [],
  ilustracionesSections = [],
  pinturaSections = [],
}: Props) {
  const tr = useTranslations('nav')
  const common = useTranslations('common')
  const locale = useLocale() as 'es' | 'en'
  const pathname = usePathname()
  const {count, toggleCart} = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const otherLocale = locale === 'es' ? 'en' : 'es'

  const categoryMenus = [
    {
      key: 'joyeria',
      label: tr('joyeria'),
      href: '/joyeria',
      items: [
        {label: tr('women'), href: '/joyeria#mujer'},
        {label: tr('men'), href: '/joyeria#hombre'},
        ...joyeriaSections.map((section) => ({
          label: t(section.title, locale),
          href: `/joyeria#${section.slug}`,
        })),
      ],
    },
    {
      key: 'ceramica',
      label: tr('ceramica'),
      href: '/ceramica',
      items: ceramicaSections.map((s) => ({
        label: t(s.title, locale),
        href: `/ceramica#${s.slug}`,
      })),
    },
    {
      key: 'ilustraciones',
      label: tr('ilustraciones'),
      href: '/ilustraciones',
      items: ilustracionesSections.map((s) => ({
        label: t(s.title, locale),
        href: `/ilustraciones#${s.slug}`,
      })),
    },
    {
      key: 'pintura',
      label: tr('pintura'),
      href: '/pintura',
      items: pinturaSections.map((s) => ({
        label: t(s.title, locale),
        href: `/pintura#${s.slug}`,
      })),
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="VIVI Taller de Arte"
            width={160}
            height={48}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {categoryMenus.map((menu) => (
            <div
              key={menu.key}
              className="relative"
              onMouseEnter={() => setOpenMenu(menu.key)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link
                href={menu.href}
                className={`nav-link ${pathname.startsWith(`/${menu.key}`) ? 'underline underline-offset-4' : ''}`}
              >
                {menu.label}
              </Link>
              {menu.items.length > 0 && openMenu === menu.key && (
                <div className="absolute left-0 top-full min-w-44 border border-line bg-surface py-2 shadow-sm">
                  {menu.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-xs uppercase tracking-[0.12em] text-foreground hover:bg-background hover:text-ochre-deep"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/exhibiciones"
            className={`nav-link ${pathname.startsWith('/exhibiciones') ? 'underline underline-offset-4' : ''}`}
          >
            {tr('exhibiciones')}
          </Link>
          <Link
            href="/about"
            className={`nav-link ${pathname.startsWith('/about') ? 'underline underline-offset-4' : ''}`}
          >
            {tr('about')}
          </Link>
          <button
            type="button"
            onClick={toggleCart}
            className="nav-link cursor-pointer"
          >
            {tr('cart')}
            {count > 0 ? ` (${count})` : ''}
          </button>
          <Link
            href={pathname || '/'}
            locale={otherLocale}
            className="nav-link text-muted"
          >
            {common('language')}
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button type="button" onClick={toggleCart} className="nav-link">
            {tr('cart')}
            {count > 0 ? ` (${count})` : ''}
          </button>
          <button
            type="button"
            className="nav-link"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-surface px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {categoryMenus.map((menu) => (
              <div key={menu.key}>
                <Link
                  href={menu.href}
                  className="nav-link block py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {menu.label}
                </Link>
                {menu.items.length > 0 && (
                  <div className="ml-3 mt-1 flex flex-col gap-1">
                    {menu.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-xs uppercase tracking-[0.12em] text-muted"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/exhibiciones" className="nav-link" onClick={() => setMobileOpen(false)}>
              {tr('exhibiciones')}
            </Link>
            <Link href="/about" className="nav-link" onClick={() => setMobileOpen(false)}>
              {tr('about')}
            </Link>
            <Link href={pathname || '/'} locale={otherLocale} className="nav-link text-muted">
              {common('language')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
