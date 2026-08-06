import {getTranslations} from 'next-intl/server'
import {Link} from '@/i18n/navigation'

export default async function NotFound() {
  const common = await getTranslations('common')
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start px-4 py-24 md:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        {common('notFound')}
      </h1>
      <Link href="/" className="catalog-link mt-8">
        {common('backHome')} →
      </Link>
    </div>
  )
}
