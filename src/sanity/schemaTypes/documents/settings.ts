import {defineField, defineType} from 'sanity'

export const settings = defineType({
  name: 'settings',
  title: 'Ajustes',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Nombre del sitio',
      type: 'string',
      initialValue: 'VIVI Taller de Arte',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp (solo dígitos, con código de país)',
      type: 'string',
      initialValue: '51954734273',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram (usuario o URL)',
      type: 'string',
      initialValue: 'vivitallerdearte',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      initialValue: 'viviartistryimagination@gmail.com',
    }),
    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps / Business',
      type: 'url',
      initialValue: 'https://maps.app.goo.gl/v8RWC44eAsGuxLNq9',
    }),
    defineField({
      name: 'address',
      title: 'Dirección (para SEO local)',
      type: 'string',
    }),
    defineField({
      name: 'city',
      title: 'Ciudad',
      type: 'string',
      initialValue: 'Perú',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Ajustes'}
    },
  },
})
