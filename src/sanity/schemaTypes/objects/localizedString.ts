import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {LocalizedStyledTextInput} from '../../components/LocalizedStyledTextInput'
import {SpanishStringInput} from '../../components/SpanishStringInput'

/** Short rich text for hero lines — bold, font, size. No headings/lists/images. */
const styledTextBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
  marks: {
    // Default fonts stay as before (body). She mainly changes size / emphasis.
    decorators: [
      {title: 'Negrita', value: 'strong'},
      {title: 'Cursiva', value: 'em'},
      {title: 'Subrayado', value: 'underline'},
      {title: 'Pequeño', value: 'sizeSm'},
      {title: 'Grande', value: 'sizeLg'},
      {title: 'Muy grande', value: 'sizeXl'},
    ],
    annotations: [],
  },
})

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

export const localizedStyledText = defineType({
  name: 'localizedStyledText',
  title: 'Texto con formato',
  type: 'object',
  components: {input: LocalizedStyledTextInput},
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      description:
        'La fuente ya está elegida. Selecciona texto → Pequeño / Grande / Muy grande (también Negrita / Cursiva).',
      type: 'array',
      of: [styledTextBlock],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      hidden: true,
      of: [styledTextBlock],
    }),
  ],
})

export const optionalLocalizedStyledText = defineType({
  name: 'optionalLocalizedStyledText',
  title: 'Texto con formato (opcional)',
  type: 'object',
  components: {input: LocalizedStyledTextInput},
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      description:
        'Opcional. La fuente ya está elegida. Selecciona texto → Pequeño / Grande / Muy grande.',
      type: 'array',
      of: [styledTextBlock],
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      hidden: true,
      of: [styledTextBlock],
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
          components: {input: ImageInputWithContinue},
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
          components: {input: ImageInputWithContinue},
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
