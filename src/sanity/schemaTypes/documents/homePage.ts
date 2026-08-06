import {defineArrayMember, defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Página de inicio',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Imagen principal (hero)',
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
      name: 'heroEyebrow',
      title: 'Texto sobre el hero',
      type: 'localizedString',
    }),
    defineField({
      name: 'sections',
      title: 'Bloques de categoría',
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
