export default {
  name: 'budynek',
  title: 'Budynek',
  type: 'document',
  fields: [
    { name: 'slug',        title: 'Slug (np. b6)',   type: 'slug', options: { source: 'nazwa' } },
    { name: 'nazwa',       title: 'Nazwa budynku',   type: 'string' },
    { name: 'podtytul',    title: 'Podtytuł',        type: 'string' },
    { name: 'opis',        title: 'Opis inwestycji', type: 'array', of: [{ type: 'block' }] },
    { name: 'heroZdjecie', title: 'Zdjęcie hero',    type: 'image', options: { hotspot: true } },
    {
      name: 'galeria',
      title: 'Galeria zdjęć',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [{ name: 'alt', title: 'Opis zdjęcia', type: 'string' }]
      }]
    },
    { name: 'lat',          title: 'Szerokość geo.',       type: 'number' },
    { name: 'lng',          title: 'Długość geo.',         type: 'number' },
    { name: 'adres',        title: 'Adres',                type: 'string' },
    { name: 'liczbaLokali', title: 'Łączna liczba lokali', type: 'number' },
    { name: 'kondygnacje',  title: 'Liczba kondygnacji',   type: 'number' },
    { name: 'north',        title: 'Kompas północy',       type: 'image',  description: 'Obrazek ze strzałką / znakiem wskazującym kierunek północy dla tego budynku' },
    {
      name: 'cechy',
      title: 'Cechy inwestycji',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'ikona', title: 'Ikona (emoji lub nazwa)', type: 'string' },
          { name: 'tytul', title: 'Tytuł',                  type: 'string' },
          { name: 'opis',  title: 'Opis',                   type: 'string' },
        ]
      }]
    },
  ]
}
