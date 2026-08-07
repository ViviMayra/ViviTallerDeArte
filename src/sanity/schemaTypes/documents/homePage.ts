import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'

export const homePage = defineType({
  name: 'homePage',
  title: 'Página de inicio',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Foto grande de portada',
      description:
        'Recomendado: horizontal 2400×1350 px (16:9). Otras medidas también funcionan; usa el punto de enfoque si recorta.',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción corta de la foto',
          type: 'localizedString',
        }),
      ],
    }),
    defineField({
      name: 'heroEyebrow',
      title: 'Texto debajo del logo en la portada',
      type: 'localizedString',
    }),
    defineField({
      name: 'featuredCarouselTitle',
      title: 'Título del carrusel destacado (opcional)',
      description: 'Aparece encima del carrusel en la página de inicio.',
      type: 'localizedString',
    }),
    defineField({
      name: 'featuredCarousel',
      title: 'Carrusel destacado',
      description:
        'Opcional. Mezcla fotos y/o piezas del catálogo. Si está vacío, el carrusel no aparece. Fotos: recomendado 1920×1080 px (16:9); otras medidas también funcionan.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'photoSlide',
          title: 'Foto',
          fields: [
            defineField({
              name: 'image',
              title: 'Foto',
              description:
                'Recomendado: 1920×1080 px (16:9). Si es otra medida, ajusta el punto de enfoque.',
              type: 'image',
              options: {hotspot: true},
              components: {input: ImageInputWithContinue},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Descripción corta de la foto',
                  type: 'optionalLocalizedString',
                }),
              ],
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {media: 'image', alt: 'image.alt.es'},
            prepare({media, alt}) {
              return {title: alt || 'Foto', media}
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'pieceSlide',
          title: 'Pieza del catálogo',
          fields: [
            defineField({
              name: 'piece',
              title: 'Pieza',
              type: 'reference',
              to: [{type: 'piece'}],
              options: {
                filter: 'status != "hidden"',
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'piece.title.es',
              media: 'piece.photos.0',
            },
            prepare({title, media}) {
              return {title: title || 'Pieza', media}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Secciones de la página (Joyería, Cerámica…)',
      description: 'Cada bloque: foto + texto + enlace al catálogo.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeSection',
          fields: [
            defineField({
              name: 'title',
              title: 'Título',
              type: 'localizedString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Texto corto',
              type: 'localizedText',
            }),
            defineField({
              name: 'image',
              title: 'Imagen',
              description:
                'Recomendado: vertical 1200×1500 px (4:5). Otras medidas también funcionan; usa el punto de enfoque si recorta.',
              type: 'image',
              options: {hotspot: true},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Texto alternativo',
                  type: 'localizedString',
                }),
              ],
            }),
            defineField({
              name: 'link',
              title: 'Enlace',
              type: 'string',
              options: {
                list: [
                  {title: 'Joyería', value: 'joyeria'},
                  {title: 'Cerámica', value: 'ceramica'},
                  {title: 'Ilustraciones', value: 'ilustraciones'},
                  {title: 'Pintura', value: 'pintura'},
                  {title: 'Exhibiciones', value: 'exhibiciones'},
                  {title: 'About', value: 'about'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title.es', media: 'image'},
          },
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Página de inicio'}
    },
  },
})
