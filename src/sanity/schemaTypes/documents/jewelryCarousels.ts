import {defineArrayMember, defineField, defineType} from 'sanity'

export const jewelryCarousels = defineType({
  name: 'jewelryCarousels',
  title: 'Carruseles de joyería',
  type: 'document',
  fields: [
    defineField({
      name: 'womenSlides',
      title: 'Carrusel Mujer',
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
    }),
    defineField({
      name: 'menSlides',
      title: 'Carrusel Hombre',
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
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Carruseles de joyería'}
    },
  },
})
