import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta título',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Meta descripción',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Imagen para compartir',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
})
