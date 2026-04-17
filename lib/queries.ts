// Query dla strony budynku (hero + opis + galeria + mapa)
export const BUDYNEK_QUERY = `
  *[_type == "budynek" && slug.current == $slug][0]{
    _id, nazwa, podtytul, slug,
    opis, adres, lat, lng,
    liczbaLokali, kondygnacje, cechy,
    "heroUrl": heroZdjecie.asset->url,
    "heroLqip": heroZdjecie.asset->metadata.lqip,
    "galeria": galeria[]{
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      alt
    }
  }
`

// Query dla lokali danego budynku (do wyszukiwarki)
export const LOKALE_BUDYNKU_QUERY = `
  *[_type == "lokal" && budynek._ref == $budynekId]{
    _id, nr, pietro, pokoje, powierzchnia, cenaZaMetr, status,
    "balkon": balkon { typ, powierzchnia },
    "thumb":     zdjecia[0].asset->url,
    "thumbRzut": rzut.asset->url
  }
`

// Query dla karty lokalu (szczegóły)
export const LOKAL_QUERY = `
  *[_type == "lokal" && _id == $id][0]{
    _id, nr, klatka, pietro, pokoje, powierzchnia, cenaZaMetr, status,
    "balkon": balkon { typ, powierzchnia },
    "pomieszczenia": pomieszczenia[] { nazwa, powierzchnia },
    "rzutUrl": rzutB.asset->url,
    "rzutKondygnacjiUrl": rzutKondygnacji.asset->url,
    "zdjecia": zdjecia[].asset->url,
    "budynek": budynek->{ nazwa, "slug": slug.current, "northUrl": north.asset->url }
  }
`

// Query dla nawigacji — lista wszystkich budynków
export const WSZYSTKIE_BUDYNKI_QUERY = `
  *[_type == "budynek"] | order(nazwa asc) {
    _id, nazwa, "slug": slug.current
  }
`
