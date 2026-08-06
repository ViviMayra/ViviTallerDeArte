import {defineField, defineType} from 'sanity'

export const jewelryType = defineType({
  name: 'jewelryType',
  title: 'Tipo de joyería',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Orden',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'title.es'},
  },
})

export const jewelrySubtype = defineType({
  name: 'jewelrySubtype',
  title: 'Subtipo de joyería',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parentType',
      title: 'Tipo padre',
      type: 'reference',
      to: [{type: 'jewelryType'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title.es',
      subtitle: 'parentType.title.es',
    },
  },
})

export const categorySubsection = defineType({
  name: 'categorySubsection',
  title: 'Subsección de categoría',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          {title: 'Cerámica', value: 'ceramica'},
          {title: 'Ilustraciones', value: 'ilustraciones'},
          {title: 'Pintura', value: 'pintura'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title.es',
      subtitle: 'category',
    },
  },
})
