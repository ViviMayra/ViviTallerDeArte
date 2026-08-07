export type Locale = 'es' | 'en'

export type LocalizedString = {
  es?: string
  en?: string
}

export type LocalizedText = LocalizedString

export type SanityImage = {
  _type?: string
  asset?: {_ref?: string; _type?: string; url?: string}
  alt?: LocalizedString
  url?: string
}

export type PieceStatus = 'available' | 'sold' | 'hidden'

export type Category =
  | 'joyeria'
  | 'ceramica'
  | 'ilustraciones'
  | 'pintura'

export type PieceTypeLabel = {
  label: LocalizedString
  slug: string
}

export type Piece = {
  _id: string
  title: LocalizedString
  slug: string
  photos?: SanityImage[]
  description?: LocalizedText
  details?: string[]
  detailsEn?: string[]
  price: number
  category: Category
  gender?: 'mujer' | 'hombre' | 'general'
  status: PieceStatus
  pieceType?: LocalizedString | null
  seo?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

export type Exhibition = {
  _id: string
  title: LocalizedString
  slug: string
  photos?: SanityImage[]
  year?: string
  place?: LocalizedString
  summary?: LocalizedText
  link?: string
  seo?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

export type Settings = {
  siteName?: string
  logo?: SanityImage
  whatsapp?: string
  instagram?: string
  email?: string
  googleMapsUrl?: string
  address?: string
  city?: string
}

export type HomeSection = {
  title: LocalizedString
  text?: LocalizedText
  image?: SanityImage
  link: string
}

export type FeaturedCarouselSlide =
  | {
      _key: string
      _type: 'photoSlide'
      image?: SanityImage
      piece?: never
    }
  | {
      _key: string
      _type: 'pieceSlide'
      piece?: Pick<
        Piece,
        '_id' | 'title' | 'slug' | 'photos' | 'price' | 'category' | 'status'
      > | null
      image?: never
    }

export type HomePage = {
  heroImage?: SanityImage
  heroEyebrow?: LocalizedString
  featuredCarouselTitle?: LocalizedString
  featuredCarousel?: FeaturedCarouselSlide[]
  sections?: HomeSection[]
  seo?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

export type AboutSection = {
  _key?: string
  body?: {
    es?: unknown[]
    en?: unknown[]
  }
}

export type AboutPage = {
  title?: LocalizedString
  sections?: AboutSection[]
  /** @deprecated Prefer `sections`. Kept so existing Sanity content still renders. */
  body?: {
    es?: unknown[]
    en?: unknown[]
  }
  seo?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

export type CartItem = {
  id: string
  slug: string
  title: string
  price: number
  imageUrl?: string
  category: string
}
