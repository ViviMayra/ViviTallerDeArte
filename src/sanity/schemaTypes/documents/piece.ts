import {defineArrayMember, defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Pieza',
  type: 'document',
  groups: [
    {name: 'content', title: 'Contenido', default: true},
    {name: 'organize', title: 'Organizar'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'photos',
      title: 'Fotos',
      description: 'La primera foto es la principal. Arrastra para reordenar.',
      type: 'array',
      group: 'content',
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
      validation: (Rule) => Rule.min(1).error('Agrega al menos una foto'),
    }),
    defineField({
      name: 'title',
      title: 'Nombre de la pieza',
      type: 'localizedString',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localizedText',
      group: 'content',
    }),
    defineField({
      name: 'details',
      title: 'Detalles',
      description: 'Ej: Plata 925, Hecho a mano… (un renglón por detalle)',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'es',
              title: 'Detalle',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'en',
              title: 'English',
              type: 'string',
              hidden: true,
            }),
          ],
          preview: {select: {title: 'es'}},
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Precio (S/)',
      type: 'number',
      group: 'content',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      group: 'organize',
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
      title: '¿Para quién?',
      description: 'Solo joyería: Mujer u Hombre.',
      type: 'string',
      group: 'organize',
      options: {
        list: [
          {title: 'Mujer', value: 'mujer'},
          {title: 'Hombre', value: 'hombre'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => document?.category !== 'joyeria',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as {category?: string} | undefined
          if (doc?.category === 'joyeria' && !value) {
            return 'Elige Mujer u Hombre'
          }
          return true
        }),
    }),
    defineField({
      name: 'section',
      title: 'Subsección (opcional)',
      description:
        'Si quieres agrupar (ej. Aretes). Créala antes en Subsecciones de esta categoría. Si no usas subsecciones, déjalo vacío.',
      type: 'reference',
      group: 'organize',
      to: [{type: 'section'}],
      options: {
        filter: ({document}) => {
          if (!document?.category) {
            return {filter: 'false'}
          }
          return {
            filter: 'category == $category',
            params: {category: document.category},
          }
        },
      },
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      group: 'organize',
      options: {
        list: [
          {title: 'Disponible (se puede comprar)', value: 'available'},
          {title: 'Vendido (se ve, no se puede comprar)', value: 'sold'},
          {title: 'Oculto (no aparece en la web)', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      description: 'Haz clic en “Generate” a partir del nombre.',
      type: 'slug',
      group: 'organize',
      options: {source: 'title.es'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO (opcional)',
      type: 'seo',
      group: 'seo',
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
      const statusLabel =
        status === 'sold' ? 'Vendido' : status === 'hidden' ? 'Oculto' : 'Disponible'
      return {
        title: title || 'Sin título',
        subtitle: `S/ ${price ?? '—'} · ${statusLabel}`,
        media,
      }
    },
  },
})
