import {defineArrayMember, defineField, defineType} from 'sanity'
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
        'Cada sección es texto e imágenes, igual que antes. Agrega más y aparecen una debajo de la otra.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'aboutSection',
          title: 'Sección',
          fields: [
            defineField({
              name: 'align',
              title: 'Posición',
              description: 'Coloca esta sección a la izquierda o a la derecha de la página.',
              type: 'string',
              options: {
                list: [
                  {title: 'Izquierda', value: 'left'},
                  {title: 'Derecha', value: 'right'},
                ],
                layout: 'radio',
              },
              initialValue: 'left',
            }),
            defineField({
              name: 'body',
              title: 'Contenido',
              description: 'Agrega texto e imágenes en el orden que quieras.',
              type: 'localizedBlockContent',
            }),
          ],
          preview: {
            select: {
              blocks: 'body.es',
              align: 'align',
            },
            prepare({
              blocks,
              align,
            }: {
              blocks?: {_type?: string; children?: {text?: string}[]}[]
              align?: string
            }) {
              const firstText = (blocks || [])
                .find((block) => block?._type === 'block')
                ?.children?.map((child) => child.text || '')
                .join('')
                .trim()
              const side = align === 'right' ? 'Derecha' : 'Izquierda'
              return {
                title: firstText || 'Sección',
                subtitle: firstText
                  ? `Sección · ${side}`
                  : `Vacía — agrega texto o fotos · ${side}`,
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
