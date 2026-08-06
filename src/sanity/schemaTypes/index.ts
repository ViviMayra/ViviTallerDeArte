import {seo} from './objects/seo'
import {
  localizedBlockContent,
  localizedString,
  localizedText,
} from './objects/localizedString'
import {section} from './documents/section'
import {piece} from './documents/piece'
import {exhibition} from './documents/exhibition'
import {homePage} from './documents/homePage'
import {aboutPage} from './documents/aboutPage'
import {settings} from './documents/settings'
import {jewelryCarousels} from './documents/jewelryCarousels'
import {categoryCarousel} from './documents/categoryCarousel'

export const schemaTypes = [
  localizedString,
  localizedText,
  localizedBlockContent,
  seo,
  section,
  piece,
  exhibition,
  homePage,
  aboutPage,
  settings,
  jewelryCarousels,
  categoryCarousel,
]
