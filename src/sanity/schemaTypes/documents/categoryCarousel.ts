import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {translateButtonField} from '../objects/translateButton'

/** Optional photo carousel under a category catalog (cerámica, ilustraciones, pintura). */
export const categoryCarousel = defineType({
  name: 'categoryCarousel',
  title: 'Carrusel del catálogo',
  type: 'document',
  fields: [
    translateButtonField,
    defineField({
      name: 'slides',
      title: 'Fotos del carrusel',
      description:
        'Opcional. Si no agregas fotos, el carrusel no aparece en la web. Fotos en tarjetas cuadradas (se ven varias a la vez). Recomendado: ~900×900 px (1:1); otras medidas también funcionan con el punto de enfoque. Al editar una foto, usa Continuar; si no carga, usa Quitar foto.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          components: {input: ImageInputWithContinue},
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción corta de la foto',
              type: 'optionalLocalizedString',
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Carrusel'}
    },
  },
})
