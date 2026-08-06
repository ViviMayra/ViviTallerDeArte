import type {StructureBuilder, StructureResolver} from 'sanity/structure'

function carouselItem(
  S: StructureBuilder,
  category: 'ceramica' | 'ilustraciones' | 'pintura',
  title: string,
) {
  return S.listItem()
    .title('Carrusel (opcional)')
    .child(
      S.document()
        .schemaType('categoryCarousel')
        .documentId(`carousel-${category}`)
        .title(`Carrusel · ${title}`),
    )
}

function categoryBranch(
  S: StructureBuilder,
  title: string,
  category: 'joyeria' | 'ceramica' | 'ilustraciones' | 'pintura',
  extraItems: ReturnType<StructureBuilder['listItem']>[] = [],
) {
  return S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items([
          S.listItem()
            .title('Piezas')
            .schemaType('piece')
            .child(
              S.documentList()
                .title(`Piezas · ${title}`)
                .filter('_type == "piece" && category == $category')
                .params({category})
                .initialValueTemplates([
                  S.initialValueTemplateItem(`piece-${category}`),
                ])
                .defaultOrdering([{field: 'title.es', direction: 'asc'}]),
            ),
          S.listItem()
            .title('Subsecciones (opcional)')
            .schemaType('section')
            .child(
              S.documentList()
                .title(`Subsecciones · ${title}`)
                .filter('_type == "section" && category == $category')
                .params({category})
                .initialValueTemplates([
                  S.initialValueTemplateItem(`section-${category}`),
                ])
                .defaultOrdering([{field: 'order', direction: 'asc'}]),
            ),
          ...extraItems,
        ]),
    )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title('VIVI')
    .items([
      categoryBranch(S, 'Joyería', 'joyeria', [
        S.listItem()
          .title('Carruseles (opcional)')
          .child(
            S.document()
              .schemaType('jewelryCarousels')
              .documentId('jewelryCarousels')
              .title('Carruseles de joyería'),
          ),
      ]),
      categoryBranch(S, 'Cerámica', 'ceramica', [
        carouselItem(S, 'ceramica', 'Cerámica'),
      ]),
      categoryBranch(S, 'Ilustraciones', 'ilustraciones', [
        carouselItem(S, 'ilustraciones', 'Ilustraciones'),
      ]),
      categoryBranch(S, 'Pintura', 'pintura', [
        carouselItem(S, 'pintura', 'Pintura'),
      ]),
      S.divider(),
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
