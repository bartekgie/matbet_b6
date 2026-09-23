export default {
  name: 'osiedle',
  title: 'Osiedle',
  type: 'document',
  fields: [
    { name: 'nazwa', title: 'Nazwa osiedla', type: 'string', description: 'np. Osiedle Nowe Miasto' },
    { name: 'miasto', title: 'Miasto', type: 'string', description: 'np. Słupsk — używane w tytułach SEO i opisach' },
    { name: 'adres', title: 'Adres', type: 'string' },
    { name: 'googleMapsUrl', title: 'Link do Google Maps', type: 'url' },
    { name: 'streetViewEmbedUrl', title: 'Link embed Street View', type: 'url', description: 'Adres z pola src w kodzie embed Google Maps (Street View)' },
    {
      name: 'miejscaWOkolicy',
      title: 'Miejsca w okolicy',
      type: 'array',
      description: 'Kafelki odległości w sekcji Lokalizacja (np. Bankomat — 400 m)',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'ikona',
            title: 'Ikona',
            type: 'string',
            options: {
              list: [
                { title: 'Plaża',               value: 'beach' },
                { title: 'Bankomat',             value: 'atm' },
                { title: 'Sklep / market',       value: 'cart' },
                { title: 'Stacja kolejowa',      value: 'train' },
                { title: 'Lotnisko',             value: 'plane' },
                { title: 'Szkoła',               value: 'school' },
                { title: 'Szpital',              value: 'hospital' },
                { title: 'Przystanek autobusowy',value: 'bus' },
                { title: 'Park / zieleń',        value: 'tree' },
                { title: 'Pętla / węzeł komunikacyjny', value: 'loop' },
              ],
            },
          },
          { name: 'nazwa',      title: 'Nazwa miejsca', type: 'string' },
          { name: 'odleglosc',  title: 'Odległość',     type: 'string', description: 'np. 400 m, 4 km' },
        ],
        preview: {
          select: { title: 'nazwa', subtitle: 'odleglosc' },
        },
      }],
    },
  ],
}
