'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],

  document: {
    // Ukryj "budynek" w globalnym menu "Utwórz nowy" dla nie-adminów
    newDocumentOptions: (prev, { currentUser }) => {
      const isAdmin = currentUser?.roles.some(r => r.name === 'administrator') ?? false
      if (isAdmin) return prev
      return prev.filter(option => option.templateId !== 'budynek')
    },

    // Zablokuj wszystkie akcje na budynku dla nie-adminów
    actions: (prev, { schemaType, currentUser }) => {
      if (schemaType !== 'budynek') return prev
      const isAdmin = currentUser?.roles.some(r => r.name === 'administrator') ?? false
      if (isAdmin) return prev
      return []
    },
  },
})
