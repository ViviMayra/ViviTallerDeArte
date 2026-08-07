import type {
  AboutPage,
  Exhibition,
  HomePage,
  Piece,
  Settings,
} from './types'

export const demoSettings: Settings = {
  siteName: 'VIVI Taller de Arte',
  whatsapp: '51954734273',
  instagram: 'vivitallerdearte',
  email: 'viviartistryimagination@gmail.com',
  googleMapsUrl: 'https://maps.app.goo.gl/v8RWC44eAsGuxLNq9',
  city: 'Perú',
}

export const demoHome: HomePage = {
  heroImage: {
    url: '/demo/hero.svg',
    alt: {es: 'VIVI Taller de Arte', en: 'VIVI Art Workshop'},
  },
  heroEyebrow: {
    es: 'Taller de Arte',
    en: 'Art Workshop',
  },
  heroSubline: {
    es: 'Piezas hechas a mano en Perú',
    en: 'Handmade pieces in Peru',
  },
  featuredCarouselTitle: {
    es: 'Destacados',
    en: 'Featured',
  },
  featuredCarousel: [
    {
      _key: 'demo-photo-1',
      _type: 'photoSlide',
      image: {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
        alt: {es: 'Joyería artesanal', en: 'Artisan jewelry'},
      },
    },
    {
      _key: 'demo-photo-2',
      _type: 'photoSlide',
      image: {
        url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80',
        alt: {es: 'Cerámica hecha a mano', en: 'Handmade ceramics'},
      },
    },
    {
      _key: 'demo-photo-3',
      _type: 'photoSlide',
      image: {
        url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1600&q=80',
        alt: {es: 'Ilustración y arte', en: 'Illustration and art'},
      },
    },
    {
      _key: 'demo-photo-4',
      _type: 'photoSlide',
      image: {
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&q=80',
        alt: {es: 'Pintura', en: 'Painting'},
      },
    },
    {
      _key: 'demo-photo-5',
      _type: 'photoSlide',
      image: {
        url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1600&q=80',
        alt: {es: 'Taller creativo', en: 'Creative workshop'},
      },
    },
  ],
  sections: [
    {
      title: {es: 'Joyería', en: 'Jewelry'},
      text: {
        es: 'Piezas hechas a mano en plata y materiales naturales.',
        en: 'Handmade pieces in silver and natural materials.',
      },
      image: {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
        alt: {es: 'Joyería', en: 'Jewelry'},
      },
      link: 'joyeria',
    },
    {
      title: {es: 'Cerámica', en: 'Ceramics'},
      text: {
        es: 'Formas únicas para el hogar y el ritual cotidiano.',
        en: 'Unique forms for the home and everyday ritual.',
      },
      image: {
        url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80',
        alt: {es: 'Cerámica', en: 'Ceramics'},
      },
      link: 'ceramica',
    },
    {
      title: {es: 'Ilustraciones', en: 'Illustrations'},
      text: {
        es: 'Dibujos e ilustraciones con identidad propia.',
        en: 'Drawings and illustrations with their own voice.',
      },
      image: {
        url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80',
        alt: {es: 'Ilustraciones', en: 'Illustrations'},
      },
      link: 'ilustraciones',
    },
    {
      title: {es: 'Pintura', en: 'Painting'},
      text: {
        es: 'Obras pictóricas disponibles para consulta.',
        en: 'Paintings available for inquiry.',
      },
      image: {
        url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80',
        alt: {es: 'Pintura', en: 'Painting'},
      },
      link: 'pintura',
    },
    {
      title: {es: 'Exhibiciones', en: 'Exhibitions'},
      text: {
        es: 'Concursos y muestras en las que ha participado VIVI.',
        en: 'Contests and shows VIVI has taken part in.',
      },
      image: {
        url: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1200&q=80',
        alt: {es: 'Exhibiciones', en: 'Exhibitions'},
      },
      link: 'exhibiciones',
    },
  ],
  seo: {
    title: 'VIVI Taller de Arte | Joyería y arte en Perú',
    description:
      'Joyería artesanal, cerámica, ilustración y pintura. Piezas únicas hechas en Perú.',
  },
}

export const demoPieces: Piece[] = [
  {
    _id: 'demo-1',
    title: {es: 'Aretes Luna', en: 'Luna Earrings'},
    slug: 'aretes-luna',
    price: 120,
    category: 'joyeria',
    gender: 'mujer',
    status: 'available',
    pieceType: {es: 'Aretes', en: 'Earrings'},
    description: {
      es: 'Aretes artesanales con motivo lunar, hechos a mano.',
      en: 'Handmade artisan earrings with a lunar motif.',
    },
    details: ['Plata 925', 'Hecho a mano en Perú'],
    detailsEn: ['Sterling silver 925', 'Handmade in Peru'],
    photos: [{url: '/demo/piece-1.svg', alt: {es: 'Aretes Luna', en: 'Luna Earrings'}}],
  },
  {
    _id: 'demo-2',
    title: {es: 'Anillo Sol', en: 'Sol Ring'},
    slug: 'anillo-sol',
    price: 95,
    category: 'joyeria',
    gender: 'mujer',
    status: 'sold',
    pieceType: {es: 'Anillos', en: 'Rings'},
    description: {
      es: 'Anillo con textura solar. Pieza única.',
      en: 'Ring with solar texture. One of a kind.',
    },
    details: ['Pieza única', 'Plata y bronce'],
    detailsEn: ['One of a kind', 'Silver and bronze'],
    photos: [{url: '/demo/piece-2.svg', alt: {es: 'Anillo Sol', en: 'Sol Ring'}}],
  },
  {
    _id: 'demo-3',
    title: {es: 'Cadena Andes', en: 'Andes Chain'},
    slug: 'cadena-andes',
    price: 180,
    category: 'joyeria',
    gender: 'hombre',
    status: 'available',
    pieceType: {es: 'Collares', en: 'Necklaces'},
    description: {
      es: 'Cadena masculina con dije geométrico.',
      en: 'Men’s chain with a geometric pendant.',
    },
    details: ['Largo ajustable'],
    detailsEn: ['Adjustable length'],
    photos: [{url: '/demo/piece-3.svg', alt: {es: 'Cadena Andes', en: 'Andes Chain'}}],
  },
  {
    _id: 'demo-4',
    title: {es: 'Cuenco Tierra', en: 'Tierra Bowl'},
    slug: 'cuenco-tierra',
    price: 150,
    category: 'ceramica',
    status: 'available',
    pieceType: {es: 'Cuencos', en: 'Bowls'},
    description: {
      es: 'Cuenco de cerámica esmaltada en tonos tierra.',
      en: 'Glazed ceramic bowl in earth tones.',
    },
    details: ['Cerámica esmaltada'],
    detailsEn: ['Glazed ceramic'],
    photos: [{url: '/demo/piece-4.svg', alt: {es: 'Cuenco Tierra', en: 'Tierra Bowl'}}],
  },
  {
    _id: 'demo-5',
    title: {es: 'Ilustración Raíz', en: 'Raíz Illustration'},
    slug: 'ilustracion-raiz',
    price: 220,
    category: 'ilustraciones',
    status: 'available',
    description: {
      es: 'Ilustración original en tinta.',
      en: 'Original ink illustration.',
    },
    photos: [{url: '/demo/piece-5.svg', alt: {es: 'Ilustración Raíz', en: 'Raíz Illustration'}}],
  },
  {
    _id: 'demo-6',
    title: {es: 'Pintura Horizonte', en: 'Horizonte Painting'},
    slug: 'pintura-horizonte',
    price: 680,
    category: 'pintura',
    status: 'available',
    description: {
      es: 'Óleo sobre lienzo, formato mediano.',
      en: 'Oil on canvas, medium format.',
    },
    photos: [{url: '/demo/piece-6.svg', alt: {es: 'Pintura Horizonte', en: 'Horizonte Painting'}}],
  },
]

export const demoExhibitions: Exhibition[] = [
  {
    _id: 'ex-1',
    title: {es: 'Muestra Colectiva Lima', en: 'Lima Collective Show'},
    slug: 'muestra-colectiva-lima',
    year: '2024',
    place: {es: 'Lima, Perú', en: 'Lima, Peru'},
    summary: {
      es: 'Participación en muestra colectiva de arte contemporáneo.',
      en: 'Participation in a contemporary art collective exhibition.',
    },
    photos: [{url: '/demo/exhibition-1.svg', alt: {es: 'Muestra', en: 'Show'}}],
  },
]

export const demoAbout: AboutPage = {
  title: {es: 'Sobre VIVI', en: 'About VIVI'},
  sections: [
    {
      _key: 'about-1',
      body: {
        es: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'VIVI Taller de Arte es un espacio de creación en Perú: joyería, cerámica, ilustración y pintura hechas a mano.',
              },
            ],
          },
        ],
        en: [
          {
            _type: 'block',
            style: 'normal',
            children: [
              {
                _type: 'span',
                text: 'VIVI Taller de Arte is a creative space in Peru: handmade jewelry, ceramics, illustration, and painting.',
              },
            ],
          },
        ],
      },
    },
  ],
  seo: {
    title: 'About | VIVI Taller de Arte',
    description: 'Conoce el taller de arte VIVI en Perú.',
  },
}

export const demoCarousels = {
  womenSlides: [
    {url: '/demo/carousel-1.svg', alt: {es: 'Joyería mujer', en: 'Women’s jewelry'}},
    {url: '/demo/carousel-2.svg', alt: {es: 'Detalle', en: 'Detail'}},
  ],
  menSlides: [
    {url: '/demo/carousel-3.svg', alt: {es: 'Joyería hombre', en: 'Men’s jewelry'}},
  ],
  generalSlides: [
    {url: '/demo/carousel-1.svg', alt: {es: 'Joyería general', en: 'General jewelry'}},
  ],
}
