import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {SpanishStringInput} from '../../components/SpanishStringInput'

/** Short rich text for hero lines — bold, font, size. No headings/lists/images. */
const styledTextBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
  marks: {
    decorators: [
      {title: 'Negrita', value: 'strong'},
      {title: 'Cursiva', value: 'em'},
      {title: 'Subrayado', value: 'underline'},
    ],
    annotations: [
      {
        name: 'textStyle',
        type: 'object',
        title: 'Fuente y tamaño',
        fields: [
          defineField({
            name: 'font',
            title: 'Fuente',
            type: 'string',
            options: {
              list: [
                {title: 'Cuerpo', value: 'body'},
                {title: 'Título (decorativa)', value: 'display'},
              ],
              layout: 'radio',
            },
          }),
          defineField({
            name: 'size',
            title: 'Tamaño',
            type: 'string',
            options: {
              list: [
                {title: 'Pequeño', value: 'sm'},
                {title: 'Normal', value: 'md'},
                {title: 'Grande', value: 'lg'},
                {title: 'Muy grande', value: 'xl'},
              ],
              layout: 'radio',
            },
          }),
        ],
      },
    ],
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
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      description:
        'Selecciona texto y usa la barra: Negrita, Cursiva, o “Fuente y tamaño”.',
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
  fields: [
    defineField({
      name: 'es',
      title: 'Texto',
      description:
        'Opcional. Selecciona texto y usa la barra: Negrita, Cursiva, o “Fuente y tamaño”.',
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
