import { type SchemaTypeDefinition } from 'sanity'
import lokal   from './lokal'
import budynek from './budynek'
import osiedle from './osiedle'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [osiedle, budynek, lokal],
}
