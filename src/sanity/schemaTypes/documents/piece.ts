import {defineArrayMember, defineField, defineType} from 'sanity'

export const piece = defineType({
  name: 'piece',
  title: 'Pieza',
  type: 'document',
  fields: [
    defineField({
      name: 'gender',
      title: 'Tipo de joyería',
      description: 'Elige primero: para mujer, para hombre, o general (para cualquiera).',
      type: 'string',
      options: {
        list: [
          {title: 'Mujer', value: 'mujer'},
          {title: 'Hombre', value: 'hombre'},
          {title: 'General (para cualquiera)', value: 'general'},
        ],
        layout: 'radio',
      },
      hidden: ({document}) => document?.category !== 'joyeria',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as {category?: string} | undefined
          if (doc?.category === 'joyeria' && !value) {
            return 'Elige Mujer, Hombre o General'
          }
          return true
        }),
    }),
    defineField({
      name: 'section',
      title: 'Tipo de pieza (opcional)',
      description:
        'Ejemplos: Aretes, Pulseras, Anillos, Collares… Créalos en “Subsecciones” de esta categoría. Si no usas grupos, déjalo vacío.',
      type: 'reference',
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
      name: 'photos',
      title: 'Fotos',
      description: 'La primera foto es la principal. Arrastra para reordenar.',
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
      validation: (Rule) => Rule.min(1).error('Agrega al menos una foto'),
    }),
    defineField({
      name: 'title',
      title: 'Nombre de la pieza',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localizedText',
    }),
    defineField({
      name: 'details',
      title: 'Detalles',
      description: 'Ej: Plata 925, Hecho a mano… (un renglón por detalle)',
      type: 'array',
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
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
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
      name: 'seo',
      title: 'SEO (opcional)',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title.es',
      media: 'photos.0',
      gender: 'gender',
      status: 'status',
      price: 'price',
    },
    prepare({title, media, gender, status, price}) {
      const statusLabel =
        status === 'sold' ? 'Vendido' : status === 'hidden' ? 'Oculto' : 'Disponible'
      const genderLabel =
        gender === 'hombre'
          ? 'Hombre'
          : gender === 'general'
            ? 'General'
            : gender === 'mujer'
              ? 'Mujer'
              : ''
      return {
        title: title || 'Sin título',
        subtitle: [genderLabel, `S/ ${price ?? '—'}`, statusLabel]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
