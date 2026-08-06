import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.listItem()
        .title('Piezas')
        .child(
          S.list()
            .title('Piezas')
            .items([
              S.listItem()
                .title('Joyería')
                .child(
                  S.documentList()
                    .title('Joyería')
                    .filter('_type == "piece" && category == "joyeria"')
                    .defaultOrdering([{field: 'title.es', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Cerámica')
                .child(
                  S.documentList()
                    .title('Cerámica')
                    .filter('_type == "piece" && category == "ceramica"')
                    .defaultOrdering([{field: 'title.es', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Ilustraciones')
                .child(
                  S.documentList()
                    .title('Ilustraciones')
                    .filter('_type == "piece" && category == "ilustraciones"')
                    .defaultOrdering([{field: 'title.es', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Pintura')
                .child(
                  S.documentList()
                    .title('Pintura')
                    .filter('_type == "piece" && category == "pintura"')
                    .defaultOrdering([{field: 'title.es', direction: 'asc'}]),
                ),
              S.divider(),
              S.listItem()
                .title('Todas las piezas')
                .child(
                  S.documentTypeList('piece').title('Todas las piezas'),
                ),
            ]),
        ),
      S.listItem()
        .title('Taxonomía')
        .child(
          S.list()
            .title('Taxonomía')
            .items([
              S.listItem()
                .title('Tipos de joyería')
                .schemaType('jewelryType')
                .child(S.documentTypeList('jewelryType').title('Tipos')),
              S.listItem()
                .title('Subtipos de joyería')
                .schemaType('jewelrySubtype')
                .child(S.documentTypeList('jewelrySubtype').title('Subtipos')),
              S.listItem()
                .title('Subsecciones (otras categorías)')
                .schemaType('categorySubsection')
                .child(
                  S.documentTypeList('categorySubsection').title(
                    'Subsecciones',
                  ),
                ),
            ]),
        ),
      S.listItem()
        .title('Carruseles joyería')
        .child(
          S.document()
            .schemaType('jewelryCarousels')
            .documentId('jewelryCarousels'),
        ),
      S.listItem()
        .title('Exhibiciones')
        .schemaType('exhibition')
        .child(S.documentTypeList('exhibition').title('Exhibiciones')),
      S.divider(),
      S.listItem()
        .title('Inicio')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('About')
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      S.listItem()
        .title('Ajustes')
        .child(S.document().schemaType('settings').documentId('settings')),
    ])
