import {defineArrayMember, defineField, defineType} from 'sanity'
import {AutoSlugInput, QuietSlugField} from '../../components/AutoSlugInput'
import {DetailsInput} from '../../components/DetailsInput'
import {ImageInputWithContinue} from '../../components/ImageInputWithContinue'
import {PieceTypeInput} from '../../components/PieceTypeInput'

export const piece = defineType({
  name: 'piece',
  title: 'Pieza',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nombre de la pieza',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      options: {source: 'title.es'},
      components: {input: AutoSlugInput, field: QuietSlugField},
      validation: (Rule) =>
        Rule.custom((value) => {
          const current = (value as {current?: string} | undefined)?.current
          if (current?.trim()) return true
          return 'Escribe el nombre arriba — la URL se crea sola'
        }),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'localizedText',
    }),
    defineField({
      name: 'gender',
      title: 'Tipo de joyería',
      description: 'Elige: para mujer, para hombre, o general (para cualquiera).',
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
      name: 'pieceType',
      title: '¿Qué tipo de pieza es? (opcional)',
      description:
        'Elige un tipo ya usado para agrupar en la web, o agrega uno nuevo (Aretes, Collares…). Déjalo vacío si no quieres subsección.',
      type: 'optionalLocalizedString',
      components: {input: PieceTypeInput},
    }),
    defineField({
      name: 'photos',
      title: 'Fotos',
      description:
        'La primera foto es la principal. Arrastra para reordenar. Al editar una foto, usa Continuar cuando termines.',
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
      validation: (Rule) => Rule.min(1).error('Agrega al menos una foto'),
    }),
    defineField({
      name: 'details',
      title: 'Detalles',
      description: 'Un detalle por caja. Ejemplo: Plata 925',
      type: 'array',
      of: [{type: 'string'}],
      components: {input: DetailsInput},
    }),
    defineField({
      name: 'detailsEn',
      title: 'Details (English)',
      type: 'array',
      of: [{type: 'string'}],
      hidden: true,
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
      name: 'category',
      title: 'Categoría',
      type: 'string',
      // Only show if missing — otherwise Publish is blocked with no visible field
      hidden: ({value}) => Boolean(value),
      options: {
        list: [
          {title: 'Joyería', value: 'joyeria'},
          {title: 'Cerámica', value: 'ceramica'},
          {title: 'Ilustraciones', value: 'ilustraciones'},
          {title: 'Pintura', value: 'pintura'},
        ],
      },
      validation: (Rule) => Rule.required().error('Elige la categoría'),
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
      pieceType: 'pieceType.es',
      status: 'status',
      price: 'price',
    },
    prepare({title, media, gender, pieceType, status, price}) {
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
        // Shown in the left list — not a field she fills
        title: title?.trim() || 'Nueva pieza',
        subtitle: [genderLabel, pieceType, price != null ? `S/ ${price}` : null, statusLabel]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
