import {defineField, defineType} from 'sanity'
import {SpanishStringInput} from '../../components/SpanishStringInput'

/** Spanish is what Mayra edits. English is filled by “Traducir al inglés” and stays hidden. */
export const localizedString = defineType({
  name: 'localizedString',
  title: 'Texto',
  type: 'object',
  components: {input: SpanishStringInput},
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      hidden: true,
    }),
  ],
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Texto largo',
  type: 'object',
  components: {input: SpanishStringInput},
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
      hidden: true,
    }),
  ],
})

/** Same as localizedString but optional (no required Spanish). */
export const optionalLocalizedString = defineType({
  name: 'optionalLocalizedString',
  title: 'Texto opcional',
  type: 'object',
  components: {input: SpanishStringInput},
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      type: 'string',
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      hidden: true,
    }),
  ],
})

export const localizedBlockContent = defineType({
  name: 'localizedBlockContent',
  title: 'Contenido',
  type: 'object',
  fields: [
    defineField({
      name: 'es',
      title: 'Contenido',
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
      hidden: true,
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
