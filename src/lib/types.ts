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

export type SectionRef = {
  _id: string
  title: LocalizedString
  slug: string
  order?: number
  category?: string
}

export type Piece = {
  _id: string
  title: LocalizedString
  slug: string
  photos?: SanityImage[]
  description?: LocalizedText
  details?: LocalizedString[]
  price: number
  category: Category
  gender?: 'mujer' | 'hombre' | 'general'
  status: PieceStatus
  section?: SectionRef | null
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

export type HomePage = {
  heroImage?: SanityImage
  heroEyebrow?: LocalizedString
  sections?: HomeSection[]
  seo?: {
    title?: string
    description?: string
    image?: SanityImage
  }
}

export type AboutPage = {
  title?: LocalizedString
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
