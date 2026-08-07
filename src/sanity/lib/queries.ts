import {groq} from 'next-sanity'

const localizedString = `{es, en}`
const localizedText = `{es, en}`
const imageFields = `{
  ...,
  alt ${localizedString}
}`

export const settingsQuery = groq`*[_type == "settings"][0]{
  siteName,
  logo ${imageFields},
  whatsapp,
  instagram,
  email,
  googleMapsUrl,
  address,
  city
}`

export const homePageQuery = groq`*[_type == "homePage"][0]{
  heroImage ${imageFields},
  heroEyebrow ${localizedString},
  featuredCarouselTitle ${localizedString},
  featuredCarousel[]{
    _key,
    _type,
    image ${imageFields},
    piece->{
      _id,
      title ${localizedString},
      "slug": slug.current,
      photos[] ${imageFields},
      price,
      category,
      status
    }
  },
  sections[]{
    title ${localizedString},
    text ${localizedText},
    image ${imageFields},
    link
  },
  seo
}`

export const aboutPageQuery = groq`*[_type == "aboutPage"][0]{
  title ${localizedString},
  body,
  seo
}`

export const piecesByCategoryQuery = groq`*[_type == "piece" && category == $category && status != "hidden"] | order(title.es asc){
  _id,
  title ${localizedString},
  "slug": slug.current,
  photos[] ${imageFields},
  description ${localizedText},
  details,
  detailsEn,
  price,
  category,
  gender,
  status,
  pieceType ${localizedString},
  seo
}`

export const pieceBySlugQuery = groq`*[_type == "piece" && slug.current == $slug && status != "hidden"][0]{
  _id,
  title ${localizedString},
  "slug": slug.current,
  photos[] ${imageFields},
  description ${localizedText},
  details,
  detailsEn,
  price,
  category,
  gender,
  status,
  pieceType ${localizedString},
  seo
}`

export const relatedPiecesQuery = groq`*[_type == "piece" && category == $category && slug.current != $slug && status != "hidden"] | order(_updatedAt desc)[0...4]{
  _id,
  title ${localizedString},
  "slug": slug.current,
  photos[] ${imageFields},
  price,
  status
}`

export const jewelryCarouselsQuery = groq`*[_type == "jewelryCarousels"][0]{
  womenSlides[] ${imageFields},
  menSlides[] ${imageFields},
  generalSlides[] ${imageFields}
}`

export const categoryCarouselQuery = groq`*[_type == "categoryCarousel" && _id in [$id, $draftId]][0]{
  slides[] ${imageFields}
}`

export const exhibitionsQuery = groq`*[_type == "exhibition"] | order(order asc, year desc){
  _id,
  title ${localizedString},
  "slug": slug.current,
  photos[] ${imageFields},
  year,
  place ${localizedString},
  summary ${localizedText},
  link,
  seo
}`

export const exhibitionBySlugQuery = groq`*[_type == "exhibition" && slug.current == $slug][0]{
  _id,
  title ${localizedString},
  "slug": slug.current,
  photos[] ${imageFields},
  year,
  place ${localizedString},
  summary ${localizedText},
  link,
  seo
}`

export const allPieceSlugsQuery = groq`*[_type == "piece" && status != "hidden"]{ "slug": slug.current, category }`
export const allExhibitionSlugsQuery = groq`*[_type == "exhibition"]{ "slug": slug.current }`
