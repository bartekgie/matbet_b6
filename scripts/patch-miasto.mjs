import { getCliClient } from 'sanity/cli'
const client = getCliClient()
await client.transaction()
  .patch('osiedle-nowe-miasto', p => p.set({ miasto: 'Słupsk' }))
  .patch('osiedle-zacisze',     p => p.set({ miasto: 'Koszalin' }))
  .commit()
console.log('OK')
