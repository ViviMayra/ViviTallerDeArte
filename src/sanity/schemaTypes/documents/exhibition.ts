import {defineArrayMember, defineField, defineType} from 'sanity'

export const exhibition = defineType({
  name: 'exhibition',
  title: 'Exhibición',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photos',
      title: 'Fotos',
      type: 'array',
      of: [
        defineArrayMember({
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
