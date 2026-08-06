import {defineField, defineType} from 'sanity'

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
      name: 'body',
      title: 'Contenido',
      description: 'Agrega texto e imágenes en el orden que quieras.',
      type: 'localizedBlockContent',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'About / Nosotros'}
    },
  },
})
