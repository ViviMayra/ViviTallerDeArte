import {defineField, defineType} from 'sanity'
import {TypeOrderInput} from '../../components/TypeOrderInput'

/** Drag order for piece subtypes (Aretes, Collares…) within a category. */
export const categoryTypeOrder = defineType({
  name: 'categoryTypeOrder',
  title: 'Orden de tipos',
  type: 'document',
  fields: [
    defineField({
      name: 'types',
      title: 'Orden de tipos',
      description:
        'Arrastra para cambiar el orden en la web y en el menú. Los tipos salen de las piezas; los nuevos aparecen al final hasta que los reordenes.',
      type: 'array',
      of: [{type: 'string'}],
      components: {input: TypeOrderInput},
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Orden de tipos'}
    },
  },
})
