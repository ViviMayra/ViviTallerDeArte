import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {projectId, dataset} from './src/sanity/env'
import {wrapPublishAction} from './src/sanity/actions/publishReadyAction'
import {translateAction} from './src/sanity/actions/translateAction'

const PIECE_CATEGORIES = [
  {id: 'joyeria', title: 'Joyería'},
  {id: 'ceramica', title: 'Cerámica'},
  {id: 'ilustraciones', title: 'Ilustraciones'},
  {id: 'pintura', title: 'Pintura'},
] as const

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
      // Drop auto piece templates — we add one clear “Nueva pieza” per category
      ...prev.filter((template) => {
        const id = String(template.id)
        return (
          id !== 'piece' &&
          !id.startsWith('piece-') &&
          id !== 'section' &&
          !id.startsWith('section-')
        )
      }),
      // One template per category. Structure wires only the matching one into
      // each Piezas list so + creates that category with no picker.
      ...PIECE_CATEGORIES.map((category) => ({
        id: `piece-${category.id}`,
        title: 'Nueva pieza',
        schemaType: 'piece' as const,
        value: {
          category: category.id,
          status: 'available' as const,
        },
      })),
    ],
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      // Global + menu: exhibitions yes; pieces only from each category list
      if (creationContext.type === 'global') {
        return prev.filter((template) => {
          const id = String(template.templateId)
          return (
            id !== 'piece' &&
            !id.startsWith('piece-') &&
            id !== 'categoryTypeOrder' &&
            id !== 'categoryCarousel' &&
            id !== 'jewelryCarousels'
          )
        })
      }
      return prev
    },
    actions: (prev, context) => {
      // Every document type that can hold Spanish → English copy
      const translateTypes = [
        'piece',
        'exhibition',
        'homePage',
        'aboutPage',
        'categoryCarousel',
        'jewelryCarousels',
      ]

      // Publish always first + focus-safe; Traducir next so Mayra sees it
      const publish = prev.find((action) => action.action === 'publish')
      const rest = prev.filter((action) => action.action !== 'publish')
      const readyPublish = publish ? wrapPublishAction(publish) : null

      if (!translateTypes.includes(context.schemaType)) {
        return readyPublish ? [readyPublish, ...rest] : rest
      }

      if (readyPublish) {
        return [readyPublish, translateAction, ...rest]
      }
      return [translateAction, ...rest]
    },
  },
})
