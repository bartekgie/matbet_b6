import { type SchemaTypeDefinition } from 'sanity'
import lokal   from './lokal'
import budynek from './budynek'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [budynek, lokal],
}