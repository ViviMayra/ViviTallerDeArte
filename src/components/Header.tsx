'use client'

import Image from 'next/image'
import {useTranslations, useLocale} from 'next-intl'
import {useState} from 'react'
import {Link, usePathname} from '@/i18n/navigation'
import {useCart} from '@/lib/cart'
import type {PieceTypeLabel} from '@/lib/types'
import {t} from '@/lib/locale'

type NavChild = {
  label: string
  href: string
  children?: {label: string; href: string}[]
}

type Props = {
  joyeriaTypesByGender?: {
    mujer: PieceTypeLabel[]
    hombre: PieceTypeLabel[]
  }
  ceramicaTypes?: PieceTypeLabel[]
  ilustracionesTypes?: PieceTypeLabel[]
  pinturaTypes?: PieceTypeLabel[]
}

export function Header({
  joyeriaTypesByGender = {mujer: [], hombre: []},
  ceramicaTypes = [],
  ilustracionesTypes = [],
  pinturaTypes = [],
}: Props) {
  const tr = useTranslations('nav')
  const common = useTranslations('common')
  const locale = useLocale() as 'es' | 'en'
  const pathname = usePathname()
  const {count, toggleCart} = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const otherLocale = locale === 'es' ? 'en' : 'es'

  const typeLinks = (types: PieceTypeLabel[], gender: 'mujer' | 'hombre') =>
    types.map((type) => ({
      label: t(type.label, locale),
      href: `/joyeria#${gender}-${type.slug}`,
    }))

  const categoryMenus: {
    key: string
    label: string
    href: string
    items: NavChild[]
  }[] = [
    {
      key: 'joyeria',
      label: tr('joyeria'),
      href: '/joyeria',
      items: [
        {
          label: tr('women'),
          href: '/joyeria#mujer',
          children: typeLinks(joyeriaTypesByGender.mujer, 'mujer'),
        },
        {
          label: tr('men'),
          href: '/joyeria#hombre',
          children: typeLinks(joyeriaTypesByGender.hombre, 'hombre'),
        },
      ],
    },
    {
      key: 'ceramica',
      label: tr('ceramica'),
      href: '/ceramica',
      items: ceramicaTypes.map((type) => ({
        label: t(type.label, locale),
        href: `/ceramica#${type.slug}`,
      })),
    },
    {
      key: 'ilustraciones',
      label: tr('ilustraciones'),
      href: '/ilustraciones',
      items: ilustracionesTypes.map((type) => ({
        label: t(type.label, locale),
        href: `/ilustraciones#${type.slug}`,
      })),
    },
    {
      key: 'pintura',
      label: tr('pintura'),
      href: '/pintura',
      items: pinturaTypes.map((type) => ({
        label: t(type.label, locale),
        href: `/pintura#${type.slug}`,
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
              onMouseEnter={() => {
                setOpenMenu(menu.key)
                setOpenSubmenu(null)
              }}
              onMouseLeave={() => {
                setOpenMenu(null)
                setOpenSubmenu(null)
              }}
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
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() =>
                        setOpenSubmenu(item.children?.length ? item.href : null)
                      }
                    >
                      <Link
                        href={item.href}
                        className="flex items-center justify-between gap-3 px-4 py-2 text-xs uppercase tracking-[0.12em] text-foreground hover:bg-background hover:text-ochre-deep"
                      >
                        <span>{item.label}</span>
                        {item.children && item.children.length > 0 && (
                          <span className="text-muted" aria-hidden>
                            ›
                          </span>
                        )}
                      </Link>
                      {item.children &&
                        item.children.length > 0 &&
                        openSubmenu === item.href && (
                          <div className="absolute left-full top-0 min-w-40 border border-line bg-surface py-2 shadow-sm">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="block px-4 py-2 text-xs uppercase tracking-[0.12em] text-foreground hover:bg-background hover:text-ochre-deep"
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
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
                      <div key={item.href}>
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={item.href}
                            className="text-xs uppercase tracking-[0.12em] text-muted"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item.label}
                          </Link>
                          {item.children && item.children.length > 0 && (
                            <button
                              type="button"
                              className="text-[10px] uppercase tracking-[0.12em] text-ochre-deep"
                              onClick={() =>
                                setMobileExpanded((v) =>
                                  v === item.href ? null : item.href,
                                )
                              }
                            >
                              {mobileExpanded === item.href ? '−' : '+'}
                            </button>
                          )}
                        </div>
                        {item.children &&
                          item.children.length > 0 &&
                          mobileExpanded === item.href && (
                            <div className="ml-3 mt-1 flex flex-col gap-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className="text-[11px] uppercase tracking-[0.12em] text-muted"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                      </div>
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
