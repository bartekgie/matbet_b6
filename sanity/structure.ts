import type { StructureResolver } from 'sanity/structure'
import { apiVersion } from './env'

type LokalMeta = { klatka?: string; pietro?: number }

export const structure: StructureResolver = (S, context) => {
  const client  = context.getClient({ apiVersion })
  const isAdmin = context.currentUser?.roles.some(r => r.name === 'administrator') ?? false

  return S.list()
    .title('Matbet CMS')
    .items([

      // ── BUDYNKI (tylko admin) ────────────────────────────────────────────────
      ...(isAdmin ? [
        S.listItem()
          .title('Budynki')
          .schemaType('budynek')
          .child(
            S.documentTypeList('budynek')
              .title('Budynki')
              .defaultOrdering([{ field: 'nazwa', direction: 'asc' }])
          ),
        S.divider(),
      ] : []),

      // ── LOKALE  Budynek → Klatka → Piętro → Lokale ──────────────────────────
      S.listItem()
        .title('Lokale')
        .schemaType('lokal')
        .child(
          S.documentTypeList('budynek')
            .title('Wybierz budynek')
            .defaultOrdering([{ field: 'nazwa', direction: 'asc' }])
            .child((budynekId: string) =>
              client
                .fetch<LokalMeta[]>(
                  `*[_type == "lokal" && budynek._ref == $id]{klatka, pietro}`,
                  { id: budynekId }
                )
                .then((meta) => {
                  // unikalne klatki A, B, C…
                  const klatki = [
                    ...new Set(meta.map((m) => m.klatka).filter((k): k is string => !!k)),
                  ].sort()

                  const klatkaItems = klatki.map((klatka) => {
                    // unikalne piętra w danej klatce
                    const pietra = [
                      ...new Set(
                        meta
                          .filter((m) => m.klatka === klatka && m.pietro != null)
                          .map((m) => m.pietro as number)
                      ),
                    ].sort((a, b) => a - b)

                    return S.listItem()
                      .id(`k-${klatka}`)
                      .title(`Klatka ${klatka}`)
                      .child(
                        S.list()
                          .title(`Klatka ${klatka}`)
                          .items(
                            pietra.map((p) =>
                              S.listItem()
                                .id(`p-${p}`)
                                .title(p === 0 ? 'Parter' : `${p}. piętro`)
                                .child(
                                  S.documentList()
                                    .title(p === 0 ? 'Parter' : `${p}. piętro`)
                                    .filter(
                                      '_type == "lokal" && budynek._ref == $budynekId && klatka == $klatka && pietro == $pietro'
                                    )
                                    .params({ budynekId, klatka, pietro: p })
                                    .defaultOrdering([{ field: 'nr', direction: 'asc' }])
                                )
                            )
                          )
                      )
                  })

                  // Lokale bez przypisanej klatki — fallback
                  const bezKlatkiCount = meta.filter((m) => !m.klatka).length
                  if (bezKlatkiCount > 0) {
                    klatkaItems.push(
                      S.listItem()
                        .id('bez-klatki')
                        .title(`⚠ Bez klatki (${bezKlatkiCount})`)
                        .child(
                          S.documentList()
                            .title('Lokale bez klatki')
                            .filter(
                              '_type == "lokal" && budynek._ref == $budynekId && !defined(klatka)'
                            )
                            .params({ budynekId })
                            .defaultOrdering([{ field: 'nr', direction: 'asc' }])
                        )
                    )
                  }

                  return S.list()
                    .title('Lokale — B')
                    .items([
                      // Płaska lista z przyciskiem "Utwórz nowy lokal"
                      S.listItem()
                        .id('wszystkie')
                        .title('+ Wszystkie / dodaj nowy')
                        .child(
                          S.documentList()
                            .title('Wszystkie lokale')
                            .filter('_type == "lokal" && budynek._ref == $budynekId')
                            .params({ budynekId })
                            .defaultOrdering([{ field: 'nr', direction: 'asc' }])
                        ),

                      ...(klatkaItems.length > 0 ? [S.divider()] : []),

                      // Foldery klatek (pojawiają się gdy lokale mają pole klatka)
                      ...klatkaItems,
                    ])
                })
            )
        ),

    ])
}
