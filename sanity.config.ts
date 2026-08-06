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
  projectId: projectId || 'placeholder',
  dataset,
  basePath: '/studio',
  plugins: [structureTool({structure}), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev) => [...prev, translateAction],
  },
})

