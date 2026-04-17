export default {
  name: 'lokal',
  title: 'Lokal',
  type: 'document',
  fields: [
    { name: 'nr',           title: 'Numer lokalu', type: 'string' },
    {
      name: 'budynek',
      title: 'Budynek',
      type: 'reference',
      to: [{ type: 'budynek' }],
    },
    {
      name: 'klatka',
      title: 'Klatka (A, B, C…)',
      type: 'string',
      description: 'Litera klatki schodowej, np. A, B, C',
    },
    { name: 'pietro',       title: 'Piętro (0 = parter)', type: 'number' },
    { name: 'pokoje',       title: 'Liczba pokoi',        type: 'number' },
    { name: 'powierzchnia', title: 'Powierzchnia (m²)',   type: 'number' },
    { name: 'cenaZaMetr',   title: 'Cena za m² (zł)',     type: 'number' },
    {
      name: 'balkon',
      title: 'Balkon / Ogródek',
      type: 'object',
      fields: [
        {
          name: 'typ',
          title: 'Rodzaj',
          type: 'string',
          initialValue: 'brak',
          options: {
            list: [
              { title: 'Brak',    value: 'brak'    },
              { title: 'Balkon',  value: 'balkon'  },
              { title: 'Ogródek', value: 'ogrodek' },
            ],
            layout: 'radio',
          },
        },
        {
          name: 'powierzchnia',
          title: 'Powierzchnia (m²)',
          type: 'number',
          hidden: ({ parent }: { parent?: { typ?: string } }) =>
            !parent?.typ || parent.typ === 'brak',
        },
      ],
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Wolne',      value: 'wolne' },
          { title: 'Rezerwacja', value: 'rezerwacja' },
          { title: 'Sprzedane',  value: 'sprzedane' },
        ]
      }
    },
    {
      name: 'pomieszczenia',
      title: 'Pomieszczenia',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {
            name: 'nazwa',
            title: 'Pomieszczenie',
            type: 'string',
            options: {
              list: [
                { title: 'Pokój',                    value: 'Pokój' },
                { title: 'Salon z aneksem kuchennym', value: 'Salon z aneksem kuchennym' },
                { title: 'Kuchnia',                  value: 'Kuchnia' },
                { title: 'Łazienka',                 value: 'Łazienka' },
                { title: 'Przedpokój',               value: 'Przedpokój' },
                { title: 'Balkon',                   value: 'Balkon' },
                { title: 'Garderoba',                value: 'Garderoba' },
                { title: 'Korytarz',                 value: 'Korytarz' },
              ],
            },
          },
          {
            name: 'powierzchnia',
            title: 'Powierzchnia (m²)',
            type: 'number',
          },
        ],
        preview: {
          select: { title: 'nazwa', subtitle: 'powierzchnia' },
          prepare({ title, subtitle }: { title?: string; subtitle?: number }) {
            return { title: title ?? '—', subtitle: subtitle != null ? `${subtitle} m²` : '' }
          },
        },
      }],
    },
    {
      name: 'rzut',
      title: 'Rzut mieszkania (kafel)',
      description: 'Miniatura widoczna na liście mieszkań',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'rzutB',
      title: 'Rzut mieszkania B (karta produktu)',
      description: 'Rzut wyświetlany na stronie szczegółów mieszkania',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'rzutKondygnacji',
      title: 'Rzut kondygnacji',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'zdjecia',
      title: 'Zdjęcia lokalu',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Tekst alternatywny (SEO)',
              type: 'string',
            }
          ]
        }
      ]
    },
  ]
}