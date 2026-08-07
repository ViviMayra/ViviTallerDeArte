import {getRequestConfig} from 'next-intl/server'
import {routing} from './routing'
import es from '../../messages/es.json'
import en from '../../messages/en.json'

const catalogs = {
  es,
  en,
} as const

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'es' | 'en')) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: catalogs[locale as keyof typeof catalogs],
  }
})
