import {seo} from './objects/seo'
import {
  localizedBlockContent,
  localizedString,
  localizedStyledText,
  localizedText,
  optionalLocalizedString,
  optionalLocalizedStyledText,
} from './objects/localizedString'
import {piece} from './documents/piece'
import {exhibition} from './documents/exhibition'
import {homePage} from './documents/homePage'
import {aboutPage} from './documents/aboutPage'
import {settings} from './documents/settings'
import {jewelryCarousels} from './documents/jewelryCarousels'
import {categoryCarousel} from './documents/categoryCarousel'
import {categoryTypeOrder} from './documents/categoryTypeOrder'

export const schemaTypes = [
  localizedString,
  optionalLocalizedString,
  localizedText,
  localizedStyledText,
  optionalLocalizedStyledText,
  localizedBlockContent,
  seo,
  piece,
  exhibition,
  homePage,
  aboutPage,
  settings,
  jewelryCarousels,
  categoryCarousel,
  categoryTypeOrder,
]
