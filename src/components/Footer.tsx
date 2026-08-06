import {getTranslations} from 'next-intl/server'
import type {Settings} from '@/lib/types'

function instagramUrl(value?: string) {
  if (!value) return 'https://www.instagram.com/vivitallerdearte/'
  if (value.startsWith('http')) return value
  return `https://www.instagram.com/${value.replace(/^@/, '')}/`
}

export async function Footer({settings}: {settings: Settings}) {
  const t = await getTranslations('footer')
  const whatsapp = (settings.whatsapp || '51954734273').replace(/\D/g, '')

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} {settings.siteName || 'VIVI Taller de Arte'}.{' '}
          {t('rights')}.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.12em]">
          <a
            href={instagramUrl(settings.instagram)}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ochre-deep"
          >
            {t('instagram')}
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ochre-deep"
          >
            {t('whatsapp')}
          </a>
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="hover:text-ochre-deep"
            >
              {t('email')}
            </a>
          )}
          {settings.googleMapsUrl && (
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ochre-deep"
            >
              {t('maps')}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
