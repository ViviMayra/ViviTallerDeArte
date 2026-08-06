import {defineArrayMember, defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Pieza',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
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
      name: 'photos',
      title: 'Fotos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Texto alternativo',
              type: 'localizedString',
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localizedText',
    }),
    defineField({
      name: 'details',
      title: 'Detalles',
      description: 'Lista tipo viñetas (material, tamaño, técnica…)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'es',
              title: 'Español',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'en',
              title: 'English',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'es'},
          },
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Precio (S/)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          {title: 'Joyería', value: 'joyeria'},
          {title: 'Cerámica', value: 'ceramica'},
          {title: 'Ilustraciones', value: 'ilustraciones'},
          {title: 'Pintura', value: 'pintura'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gender',
      title: 'Género',
      type: 'string',
      options: {
        list: [
          {title: 'Mujer', value: 'mujer'},
          {title: 'Hombre', value: 'hombre'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => document?.category !== 'joyeria',
    }),
    defineField({
      name: 'jewelryType',
      title: 'Tipo',
      type: 'reference',
      to: [{type: 'jewelryType'}],
      hidden: ({document}) => document?.category !== 'joyeria',
    }),
    defineField({
      name: 'jewelrySubtype',
      title: 'Subtipo',
      type: 'reference',
      to: [{type: 'jewelrySubtype'}],
      hidden: ({document}) => document?.category !== 'joyeria',
    }),
    defineField({
      name: 'subsection',
      title: 'Subsección',
      type: 'reference',
      to: [{type: 'categorySubsection'}],
      hidden: ({document}) =>
        !document?.category || document.category === 'joyeria',
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          {title: 'Disponible', value: 'available'},
          {title: 'Vendido', value: 'sold'},
          {title: 'Oculto', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'translateNote',
      title: 'Traducir al inglés',
      description:
        'Guarda el documento, luego usa el botón “Traducir al inglés” en la barra superior del Studio (o visita /studio y ejecuta la acción). También puedes llamar POST /api/translate con el documentId.',
      type: 'string',
      readOnly: true,
      initialValue: 'Completa los campos en español, guarda, luego traduce.',
    }),
  ],
  preview: {
    select: {
      title: 'title.es',
      media: 'photos.0',
      category: 'category',
      status: 'status',
      price: 'price',
    },
    prepare({title, media, category, status, price}) {
      return {
        title: title || 'Sin título',
        subtitle: `${category || ''} · S/ ${price ?? '—'} · ${status || ''}`,
        media,
      }
    },
  },
})
