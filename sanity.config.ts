import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {projectId, dataset} from './src/sanity/env'
import {translateAction} from './src/sanity/actions/translateAction'

export default defineConfig({
  name: 'vivi',
  title: 'VIVI Taller de Arte',
  projectId,
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
          id !== 'piece-by-category' &&
          !id.startsWith('piece-') &&
          id !== 'section' &&
          !id.startsWith('section-')
        )
      }),
      // One template — category comes from the list you clicked + in
      {
        id: 'piece-by-category',
        title: 'Nueva pieza',
        schemaType: 'piece' as const,
        parameters: [{name: 'category', type: 'string' as const}],
        value: (params: {category?: string}) => ({
          category: params.category,
          status: 'available' as const,
        }),
      },
    ],
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      // Never offer “pick a category” from the top-right global + menu
      if (creationContext.type === 'global') {
        return prev.filter(
          (template) =>
            template.templateId !== 'piece' &&
            template.templateId !== 'piece-by-category' &&
            !String(template.templateId).startsWith('piece-'),
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
