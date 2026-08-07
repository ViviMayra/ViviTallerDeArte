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
        'Recomendado: horizontal 2400×1350 px (16:9). Otras medidas también funcionan; usa el punto de enfoque si recorta. Al editar la foto, usa Continuar cuando termines. Si no carga, usa Quitar foto.',
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
    }),
    defineField({
      name: 'heroEyebrow',
      title: 'Texto debajo del logo (línea principal)',
      description:
        'Selecciona texto → “Fuente y tamaño” (fuente + número). Cuando termines, pulsa Continuar y luego Publish.',
      type: 'localizedStyledText',
    }),
    defineField({
      name: 'heroSubline',
      title: 'Segunda línea debajo del logo (opcional)',
      description:
        'Opcional. Igual: “Fuente y tamaño”, luego Continuar, luego Publish.',
      type: 'optionalLocalizedStyledText',
    }),
    defineField({
      name: 'featuredCarouselTitle',
      title: 'Título del carrusel destacado (opcional)',
      description: 'Aparece encima del carrusel en la página de inicio.',
      type: 'optionalLocalizedString',
    }),
    defineField({
      name: 'featuredCarousel',
      title: 'Carrusel destacado',
      description:
        'Opcional. Mezcla fotos y/o piezas del catálogo (aparecen como tarjetas cuadradas). Si está vacío, el carrusel no aparece. Fotos: recomendado ~900×900 px (1:1); otras medidas también funcionan con el punto de enfoque.',
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
                'Recomendado: ~900×900 px (cuadrada). Otras medidas funcionan; ajusta el punto de enfoque. Usa Continuar cuando termines; Quitar foto si no carga.',
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
              validation: (Rule) =>
                Rule.custom((value) => {
                  const es = (value as {es?: string} | undefined)?.es
                  if (typeof es === 'string' && es.trim()) return true
                  return 'Escribe el título'
                }),
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
                'Recomendado: vertical 1200×1500 px (4:5). Otras medidas también funcionan; usa el punto de enfoque si recorta. Al editar la foto, usa Continuar cuando termines. Si no carga, usa Quitar foto.',
              type: 'image',
              options: {hotspot: true},
              components: {input: ImageInputWithContinue},
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Texto alternativo',
                  type: 'optionalLocalizedString',
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
