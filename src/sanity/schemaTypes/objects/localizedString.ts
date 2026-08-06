import {defineField, defineType} from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Texto (ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
    }),
  ],
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Texto largo (ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
    }),
  ],
})

export const localizedBlockContent = defineType({
  name: 'localizedBlockContent',
  title: 'Contenido (ES / EN)',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Español',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Texto alternativo',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
          ],
        },
      ],
    }),
  ],
})
