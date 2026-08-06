import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      title: 'Título para Google (opcional)',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Descripción para Google (opcional)',
      type: 'text',
      rows: 3,
    }),
  ],
})

