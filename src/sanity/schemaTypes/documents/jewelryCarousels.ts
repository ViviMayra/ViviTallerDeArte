import {defineArrayMember, defineField, defineType} from 'sanity'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {translateButtonField} from '../objects/translateButton'

const slideField = (name: string, title: string) =>
  defineField({
    name,
    title,
    description:
      'Opcional. Si no hay fotos, ese carrusel no se muestra. Fotos en tarjetas cuadradas (se ven varias a la vez). Recomendado: ~900×900 px (1:1); otras medidas también funcionan con el punto de enfoque. Al editar una foto, usa Continuar; si no carga, usa Quitar foto.',
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
  })

export const jewelryCarousels = defineType({
  name: 'jewelryCarousels',
  title: 'Carruseles de joyería',
  type: 'document',
  fields: [
    slideField('womenSlides', 'Carrusel debajo de Mujer'),
    slideField('menSlides', 'Carrusel debajo de Hombre'),
    slideField('generalSlides', 'Carrusel debajo de General'),
    translateButtonField,
  ],
  preview: {
    prepare() {
      return {title: 'Carruseles de joyería'}
    },
  },
})
