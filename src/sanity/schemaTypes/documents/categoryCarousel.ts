import {defineArrayMember, defineField, defineType} from 'sanity'

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
        'Opcional. Si no agregas fotos, el carrusel no aparece en la web. Arrastra para reordenar.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción corta de la foto',
              type: 'localizedString',
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
