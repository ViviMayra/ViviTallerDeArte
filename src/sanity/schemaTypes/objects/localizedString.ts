import {defineArrayMember, defineField, defineType} from 'sanity'
import {HERO_FONTS, HERO_SIZES} from '@/lib/hero-fonts'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {LocalizedStyledTextInput} from '../../components/LocalizedStyledTextInput'
import {SpanishStringInput} from '../../components/SpanishStringInput'
import {TextStyleAnnotationInput} from '../../components/TextStyleAnnotationInput'

/** Short rich text for hero lines — bold, real fonts, numeric sizes. */
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
        components: {input: TextStyleAnnotationInput},
        fields: [
          defineField({
            name: 'font',
            title: 'Fuente',
            type: 'string',
            options: {
              list: HERO_FONTS.map((font) => ({
                title: font.title,
                value: font.value,
              })),
              layout: 'radio',
            },
            initialValue: 'body',
          }),
          defineField({
            name: 'size',
            title: 'Tamaño (número)',
            type: 'number',
            options: {
              list: HERO_SIZES.map((size) => ({
                title: String(size),
                value: size,
              })),
              layout: 'dropdown',
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
      // Don't hard-require here — empty leftover objects used to block Publish.
      // Document fields that need Spanish use their own Rule.required()/custom.
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value == null || value === '') return true
          if (typeof value === 'string' && !value.trim()) {
            return 'Escribe el texto o bórralo del todo'
          }
          return true
        }),
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
      validation: (Rule) =>
        Rule.custom((value) => {
          if (value == null || value === '') return true
          if (typeof value === 'string' && !value.trim()) {
            return 'Escribe el texto o bórralo del todo'
          }
          return true
        }),
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
        'Selecciona texto → botón “Fuente y tamaño”: elige fuente y un número (12, 14, 16…). También Negrita / Cursiva.',
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
        'Opcional. Selecciona texto → “Fuente y tamaño” (fuente + número).',
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
