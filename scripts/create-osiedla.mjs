import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const MIEJSCA = [
  { ikona: 'beach',    nazwa: 'Ustka',           odleglosc: '18 km'  },
  { ikona: 'atm',      nazwa: 'Bankomat',        odleglosc: '400 m'  },
  { ikona: 'cart',     nazwa: 'Supermarket',     odleglosc: '400 m'  },
  { ikona: 'train',    nazwa: 'Stacja kolejowa', odleglosc: '4 km'   },
  { ikona: 'plane',    nazwa: 'Lotnisko',        odleglosc: '120 km' },
  { ikona: 'school',   nazwa: 'Szkoły',          odleglosc: '200 m'  },
  { ikona: 'hospital', nazwa: 'Szpital',         odleglosc: '3,5 km' },
  { ikona: 'bus',      nazwa: 'Przystanek',      odleglosc: '100 m'  },
  { ikona: 'tree',     nazwa: 'Park Zachodni',   odleglosc: '500 m'  },
  { ikona: 'loop',     nazwa: 'Pętla autobusowa',odleglosc: '900 m'  },
].map((m, i) => ({ ...m, _key: `m${i}` }))

const noweMiasto = {
  _id: 'osiedle-nowe-miasto',
  _type: 'osiedle',
  nazwa: 'Osiedle Nowe Miasto',
  adres: 'ul. Dywizjonu 303 / ul. Legionów Polskich',
  googleMapsUrl: 'https://maps.app.goo.gl/xQP8FjLKFMRYDA2AA',
  streetViewEmbedUrl: 'https://www.google.com/maps/embed?pb=!4v1776367986058!6m8!1m7!1sAErv5rsj5UU4tqp3WDf40w!2m2!1d54.46536378406788!2d16.98121339286148!3f295.57545326196043!4f-1.7544951324730391!5f0.7820865974627469',
  miejscaWOkolicy: MIEJSCA,
}

const zacisze = {
  _id: 'osiedle-zacisze',
  _type: 'osiedle',
  nazwa: 'Osiedle Zacisze',
  adres: 'Koszalin, ul. Żytnia',
  // googleMapsUrl / streetViewEmbedUrl celowo puste - nie kopiujemy linku do innego miasta,
  // klient uzupelni prawdziwe dane. Kod ma to obslugiwac (ukrywac sekcje jesli puste).
  miejscaWOkolicy: MIEJSCA,
}

const tx = client.transaction()
  .createIfNotExists(noweMiasto)
  .createIfNotExists(zacisze)

// jesli dokument juz istnieje (np. z poprzedniej proby), i tak nadpisz tresc, zeby byc pewnym stanu
tx.createOrReplace(noweMiasto)
tx.createOrReplace(zacisze)

const result = await tx.commit()
console.log('OK, utworzone/zaktualizowane dokumenty:', result.results.map(r => r.id))

// Podpiecie budynkow pod osiedla
const linkTx = client.transaction()
const budynki = await client.fetch(`*[_type=="budynek"]{_id, "slug": slug.current}`)
for (const b of budynki) {
  const osiedleId = b.slug === 'K53' ? 'osiedle-zacisze' : 'osiedle-nowe-miasto'
  linkTx.patch(b._id, p => p.set({ osiedle: { _type: 'reference', _ref: osiedleId } }))
}
const linkResult = await linkTx.commit()
console.log('Podpiete budynki:', budynki.map(b => `${b.slug} -> ${b.slug === 'K53' ? 'Zacisze' : 'Nowe Miasto'}`))
