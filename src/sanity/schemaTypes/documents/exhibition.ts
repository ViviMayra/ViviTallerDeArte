import {defineArrayMember, defineField, defineType} from 'sanity'
import {AutoSlugInput, QuietSlugField} from '../../components/AutoSlugInput'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'

export const exhibition = defineType({
  name: 'exhibition',
  title: 'Exhibición',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre de la exhibición',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'title.es'},
      components: {input: AutoSlugInput, field: QuietSlugField},
      validation: (Rule) =>
        Rule.custom((value) => {
          const current = (value as {current?: string} | undefined)?.current
          if (current?.trim()) return true
          return 'Escribe el nombre arriba — la URL se crea sola'
        }),
    }),
    defineField({
      name: 'photos',
      title: 'Fotos (todas las que quieras)',
      description:
        'Al editar una foto, usa Continuar cuando termines. Si no carga, usa Quitar foto.',
      type: 'array',
      of: [
        defineArrayMember({
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
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'year',
      title: 'Año',
      type: 'string',
    }),
    defineField({
      name: 'place',
      title: 'Lugar',
      type: 'localizedString',
    }),
    defineField({
      name: 'summary',
      title: 'Resumen',
      type: 'localizedText',
    }),
    defineField({
      name: 'link',
      title: 'Enlace opcional',
      type: 'url',
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Orden',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title.es',
      media: 'photos.0',
      year: 'year',
      place: 'place.es',
    },
    prepare({title, media, year, place}) {
      return {
        title: title || 'Exhibición',
        subtitle: [year, place].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
