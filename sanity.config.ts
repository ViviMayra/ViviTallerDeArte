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
        title: 'Nueva pieza',
        schemaType: 'piece' as const,
        value: {
          category: category.id,
          status: 'available',
        },
      })),
    ],
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (template) =>
            !String(template.templateId).startsWith('piece-') &&
            template.templateId !== 'piece',
        )
      }
      return prev
    },
    actions: (prev, context) => {
      const translateTypes = [
        'piece',
        'exhibition',
        'homePage',
        'aboutPage',
      ]
      if (translateTypes.includes(context.schemaType)) {
        return [...prev, translateAction]
      }
      return prev
    },
  },
})
