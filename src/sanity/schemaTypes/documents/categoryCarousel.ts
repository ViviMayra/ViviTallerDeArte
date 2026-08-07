import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'

/** Optional photo carousel under a category catalog (cerámica, ilustraciones, pintura). */
export const categoryCarousel = defineType({
  name: 'categoryCarousel',
  title: 'Carrusel del catálogo',
  type: 'document',
  fields: [
    defineField({
      name: 'slides',
      title: 'Fotos del carrusel',
      description:
        'Opcional. Si no agregas fotos, el carrusel no aparece en la web. Recomendado: 1920×1080 px (16:9); otras medidas también funcionan. Al editar una foto, usa Continuar.',
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
