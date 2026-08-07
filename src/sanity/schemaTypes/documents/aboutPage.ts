import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {translateButtonField} from '../objects/translateButton'

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About / Nosotros',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de página',
      type: 'localizedString',
    }),
    defineField({
      name: 'sections',
      title: 'Secciones',
      description:
        'Cada sección es texto e imágenes. Puedes apilarlas o poner la foto al lado del texto.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'aboutSection',
          title: 'Sección',
          fields: [
            defineField({
              name: 'layout',
              title: 'Diseño',
              description:
                'Apilado = uno debajo del otro. Al lado = foto y texto juntos en fila.',
              type: 'string',
              options: {
                list: [
                  {title: 'Apilado', value: 'stacked'},
                  {title: 'Foto al lado del texto', value: 'sideBySide'},
                ],
                layout: 'radio',
              },
              initialValue: 'stacked',
            }),
            defineField({
              name: 'align',
              title: 'Posición',
              description:
                'Coloca esta sección a la izquierda, al centro o a la derecha de la página.',
              type: 'string',
              options: {
                list: [
                  {title: 'Izquierda', value: 'left'},
                  {title: 'Centro', value: 'center'},
                  {title: 'Derecha', value: 'right'},
                ],
                layout: 'radio',
              },
              initialValue: 'left',
              hidden: ({parent}) => parent?.layout === 'sideBySide',
            }),
            defineField({
              name: 'imageSide',
              title: 'Lado de la foto',
              description: '¿La foto va a la izquierda o a la derecha del texto?',
              type: 'string',
              options: {
                list: [
                  {title: 'Foto a la izquierda', value: 'left'},
                  {title: 'Foto a la derecha', value: 'right'},
                ],
                layout: 'radio',
              },
              initialValue: 'left',
              hidden: ({parent}) => parent?.layout !== 'sideBySide',
            }),
            defineField({
              name: 'image',
              title: 'Foto',
              description:
                'Esta es la foto que va al lado del texto. Usa Continuar cuando termines.',
              type: 'image',
              options: {hotspot: true},
              components: {input: ImageInputWithContinue},
              hidden: ({parent}) => parent?.layout !== 'sideBySide',
              fields: [
                defineField({
                  name: 'widthPercent',
                  title: 'Ancho (%)',
                  description:
                    'Porcentaje del espacio de la foto. Ej: 80. Vacío o 100 = todo el espacio.',
                  type: 'number',
                  initialValue: 100,
                  validation: (Rule) => Rule.min(10).max(100).integer(),
                }),
                defineField({
                  name: 'alt',
                  title: 'Texto alternativo',
                  type: 'optionalLocalizedString',
                }),
              ],
            }),
            defineField({
              name: 'body',
              title: 'Contenido',
              description:
                'Texto (e imágenes si usas Apilado). En “Foto al lado”, sube la foto arriba y escribe el texto aquí.',
              type: 'localizedBlockContent',
            }),
          ],
          preview: {
            select: {
              blocks: 'body.es',
              align: 'align',
              layout: 'layout',
              imageSide: 'imageSide',
              media: 'image',
            },
            prepare({
              blocks,
              align,
              layout,
              imageSide,
              media,
            }: {
              blocks?: {_type?: string; children?: {text?: string}[]}[]
              align?: string
              layout?: string
              imageSide?: string
              media?: unknown
            }) {
              const firstText = (blocks || [])
                .find((block) => block?._type === 'block')
                ?.children?.map((child) => child.text || '')
                .join('')
                .trim()
              const layoutLabel =
                layout === 'sideBySide'
                  ? imageSide === 'right'
                    ? 'Al lado · foto derecha'
                    : 'Al lado · foto izquierda'
                  : align === 'right'
                    ? 'Apilado · Derecha'
                    : align === 'center'
                      ? 'Apilado · Centro'
                      : 'Apilado · Izquierda'
              return {
                title: firstText || 'Sección',
                subtitle: firstText
                  ? layoutLabel
                  : `Vacía — agrega texto o fotos · ${layoutLabel}`,
                media,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Contenido anterior',
      description:
        'Si aún tienes texto aquí, muévelo a una Sección arriba. Este campo desaparece cuando ya hay secciones.',
      type: 'localizedBlockContent',
      hidden: ({document}) =>
        Array.isArray(document?.sections) && document.sections.length > 0,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    translateButtonField,
  ],
  preview: {
    prepare() {
      return {title: 'About / Nosotros'}
    },
  },
})
