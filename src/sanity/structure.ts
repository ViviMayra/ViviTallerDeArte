import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

const CATEGORIES = [
  {id: 'joyeria', title: 'Joyería'},
  {id: 'ceramica', title: 'Cerámica'},
  {id: 'ilustraciones', title: 'Ilustraciones'},
  {id: 'pintura', title: 'Pintura'},
] as const

function carouselItem(
  S: Parameters<StructureResolver>[0],
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

function typeOrderItem(
  S: Parameters<StructureResolver>[0],
  category: (typeof CATEGORIES)[number]['id'],
  title: string,
) {
  return S.listItem()
    .title('Orden de tipos')
    .child(
      S.document()
        .schemaType('categoryTypeOrder')
        .documentId(`type-order-${category}`)
        .title(`Orden de tipos · ${title}`),
    )
}

function categoryBranch(
  S: Parameters<StructureResolver>[0],
  context: Parameters<StructureResolver>[1],
  title: string,
  category: (typeof CATEGORIES)[number]['id'],
  extraItems: ReturnType<Parameters<StructureResolver>[0]['listItem']>[] = [],
) {
  return S.listItem()
    .title(title)
    .child(
      S.list()
        .title(title)
        .items([
          orderableDocumentListDeskItem({
            type: 'piece',
            title: 'Piezas',
            id: `orderable-pieces-${category}`,
            filter: `category == $category`,
            params: {category},
            createIntent: false,
            menuItems: [
              S.menuItem()
                .title('Nueva pieza')
                .intent({
                  type: 'create',
                  params: {type: 'piece', template: `piece-${category}`},
                })
                .serialize(),
            ],
            S,
            context,
          }),
          typeOrderItem(S, category, title),
          ...extraItems,
        ]),
    )
}

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('VIVI')
    .items([
      categoryBranch(S, context, 'Joyería', 'joyeria', [
        S.listItem()
          .title('Carruseles (opcional)')
          .child(
            S.document()
              .schemaType('jewelryCarousels')
              .documentId('jewelryCarousels')
              .title('Carruseles de joyería'),
          ),
      ]),
      categoryBranch(S, context, 'Cerámica', 'ceramica', [
        carouselItem(S, 'ceramica', 'Cerámica'),
      ]),
      categoryBranch(S, context, 'Ilustraciones', 'ilustraciones', [
        carouselItem(S, 'ilustraciones', 'Ilustraciones'),
      ]),
      categoryBranch(S, context, 'Pintura', 'pintura', [
        carouselItem(S, 'pintura', 'Pintura'),
      ]),
      S.divider(),
      S.listItem()
        .title('Exhibiciones')
        .schemaType('exhibition')
        .child(
          S.documentTypeList('exhibition')
            .title('Exhibiciones')
            .initialValueTemplates([
              S.initialValueTemplateItem('exhibition'),
            ]),
        ),
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
