import {defineArrayMember, defineField, defineType} from 'sanity'

const slideField = (name: string, title: string) =>
  defineField({
    name,
    title,
    description:
      'Opcional. Si no hay fotos, ese carrusel no se muestra. Aparece debajo del catálogo.',
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
  })

export const jewelryCarousels = defineType({
  name: 'jewelryCarousels',
  title: 'Carruseles de joyería',
  type: 'document',
  fields: [
    slideField('womenSlides', 'Carrusel debajo de Mujer'),
    slideField('menSlides', 'Carrusel debajo de Hombre'),
  ],
  preview: {
    prepare() {
      return {title: 'Carruseles de joyería'}
    },
  },
})
