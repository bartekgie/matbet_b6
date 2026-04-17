export interface Budynek {
  _id: string
  nazwa: string
  podtytul?: string
  slug: { current: string }
  opis?: any[]
  heroUrl?: string
  heroLqip?: string
  galeria?: GaleriaItem[]
  lat?: number
  lng?: number
  adres?: string
  liczbaLokali?: number
  kondygnacje?: number
  cechy?: Cecha[]
}

export interface GaleriaItem {
  url: string
  lqip?: string
  alt?: string
}

export interface Cecha {
  ikona?: string
  tytul: string
  opis?: string
}

export interface Pomieszczenie {
  nazwa: string
  powierzchnia: number
}

export interface Lokal {
  _id: string
  nr: string
  klatka?: string
  pietro: number
  pokoje: number
  powierzchnia: number
  cenaZaMetr?: number
  status: 'wolne' | 'rezerwacja' | 'sprzedane'
  balkon?: { typ: 'balkon' | 'ogrodek' | 'brak'; powierzchnia?: number }
  // pola z listingu (thumbnail)
  thumb?: string
  thumbRzut?: string
  // pola z karty lokalu (szczegóły)
  pomieszczenia?: Pomieszczenie[]
  rzutUrl?: string
  rzutKondygnacjiUrl?: string
  zdjecia?: string[]
  budynek?: { nazwa: string; slug: string; northUrl?: string }
}
