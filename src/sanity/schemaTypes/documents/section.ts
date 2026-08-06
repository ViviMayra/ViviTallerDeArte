import {defineField, defineType} from 'sanity'

/** Optional subsection inside a category (e.g. Aretes under Joyería). */
export const section = defineType({
  name: 'section',
  title: 'Subsección',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre de la subsección',
      description: 'Ejemplo: Aretes, Anillos, Cuencos…',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      hidden: true,
      options: {
        list: [
          {title: 'Joyería', value: 'joyeria'},
          {title: 'Cerámica', value: 'ceramica'},
          {title: 'Ilustraciones', value: 'ilustraciones'},
          {title: 'Pintura', value: 'pintura'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden en la página',
      type: 'number',
      initialValue: 0,
      description: 'Número más bajo aparece primero.',
    }),
  ],
  preview: {
    select: {title: 'title.es', category: 'category'},
    prepare({title, category}) {
      return {
        title: title || 'Subsección',
        subtitle: category || '',
      }
    },
  },
})
