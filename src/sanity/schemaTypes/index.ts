import {seo} from './objects/seo'
import {
  localizedBlockContent,
  localizedString,
  localizedText,
} from './objects/localizedString'
import {
  categorySubsection,
  jewelrySubtype,
  jewelryType,
} from './documents/jewelryType'
import {piece} from './documents/piece'
import {exhibition} from './documents/exhibition'
import {homePage} from './documents/homePage'
import {aboutPage} from './documents/aboutPage'
import {settings} from './documents/settings'
import {jewelryCarousels} from './documents/jewelryCarousels'

export const schemaTypes = [
  localizedString,
  localizedText,
  localizedBlockContent,
  seo,
  jewelryType,
  jewelrySubtype,
  categorySubsection,
  piece,
  exhibition,
  homePage,
  aboutPage,
  settings,
  jewelryCarousels,
]
