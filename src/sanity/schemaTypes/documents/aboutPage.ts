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
        'Cada sección es texto e imágenes. En Posición puedes apilarlas o poner la foto al lado del texto.',
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
              description:
                'Izquierda / Centro / Derecha = contenido apilado en ese lado. Las opciones con foto ponen la imagen al lado del texto.',
              type: 'string',
              options: {
                list: [
                  {title: 'Izquierda', value: 'left'},
                  {title: 'Centro', value: 'center'},
                  {title: 'Derecha', value: 'right'},
                  {
                    title: 'Foto izquierda + texto',
                    value: 'sideLeft',
                  },
                  {
                    title: 'Foto derecha + texto',
                    value: 'sideRight',
                  },
                ],
                layout: 'radio',
              },
              initialValue: 'left',
            }),
            defineField({
              name: 'image',
              title: 'Foto',
              description:
                'Foto que va al lado del texto. Usa Continuar cuando termines.',
              type: 'image',
              options: {hotspot: true},
              components: {input: ImageInputWithContinue},
              hidden: ({parent}) =>
                parent?.align !== 'sideLeft' && parent?.align !== 'sideRight',
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
                'Texto e imágenes. Si elegiste una opción con foto al lado, sube la Foto arriba y escribe el texto aquí.',
              type: 'localizedBlockContent',
            }),
          ],
          preview: {
            select: {
              blocks: 'body.es',
              align: 'align',
              media: 'image',
            },
            prepare({blocks, align, media}) {
              const firstText = (blocks || [])
                .find((block: {_type?: string}) => block?._type === 'block')
                ?.children?.map((child: {text?: string}) => child.text || '')
                .join('')
                .trim()
              const place =
                align === 'sideRight'
                  ? 'Foto derecha + texto'
                  : align === 'sideLeft'
                    ? 'Foto izquierda + texto'
                    : align === 'right'
                      ? 'Derecha'
                      : align === 'center'
                        ? 'Centro'
                        : 'Izquierda'
              return {
                title: firstText || 'Sección',
                subtitle: firstText
                  ? place
                  : `Vacía — agrega texto o fotos · ${place}`,
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
