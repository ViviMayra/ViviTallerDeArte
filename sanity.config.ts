import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {projectId, dataset} from './src/sanity/env'
import {translateAction} from './src/sanity/actions/translateAction'

const categories = [
  {id: 'joyeria', title: 'Joyería'},
  {id: 'ceramica', title: 'Cerámica'},
  {id: 'ilustraciones', title: 'Ilustraciones'},
  {id: 'pintura', title: 'Pintura'},
] as const

export default defineConfig({
  name: 'vivi',
  title: 'VIVI Taller de Arte',
  projectId: projectId || 'placeholder',
  dataset,
  basePath: '/studio',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((template) => {
        const id = String(template.id)
        return (
          id !== 'piece' &&
          id !== 'section' &&
          !id.startsWith('piece-') &&
          !id.startsWith('section-')
        )
      }),
      ...categories.map((category) => ({
        id: `piece-${category.id}`,
        title: `Pieza · ${category.title}`,
        schemaType: 'piece' as const,
        value: {
          category: category.id,
          status: 'available',
        },
      })),
      ...categories.map((category) => ({
        id: `section-${category.id}`,
        title: `Subsección · ${category.title}`,
        schemaType: 'section' as const,
        value: {
          category: category.id,
          order: 0,
        },
      })),
    ],
  },
  document: {
    actions: (prev, context) => {
      const translateTypes = [
        'piece',
        'exhibition',
        'homePage',
        'aboutPage',
        'section',
      ]
      if (translateTypes.includes(context.schemaType)) {
        return [...prev, translateAction]
      }
      return prev
    },
  },
})
