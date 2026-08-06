# VIVI Taller de Arte

Bilingual (ES/EN) atelier website for [VIVI Taller de Arte](https://www.instagram.com/vivitallerdearte/) — jewelry, ceramics, illustrations, painting, and exhibitions. Content is managed in Sanity. Checkout opens WhatsApp (no Stripe).

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Sanity CMS (Studio at `/studio`)
- next-intl (Spanish default, English toggle)
- Vercel hosting (recommended)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

- Site: [http://localhost:3000/es](http://localhost:3000/es)
- Studio: [http://localhost:3000/studio](http://localhost:3000/studio) (needs a real Sanity project ID)

Without Sanity credentials, the site runs on **demo content** so you can develop UI immediately.

## Connect Sanity (her account)

1. Create a project at [sanity.io/manage](https://www.sanity.io/manage) (invite both of you as admins).
2. Put values in `.env.local` / Vercel env:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-01-01
SANITY_API_WRITE_TOKEN=...          # for “Traducir al inglés”
TRANSLATE_API_KEY=...               # optional OpenAI-compatible key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

3. Open `/studio`, fill **Ajustes**, **Inicio**, pieces, etc.
4. On a piece document, use the document action **Traducir al inglés** after saving Spanish fields.

### Studio sidebar (simple for Mayra)

- **Joyería** → Piezas · Subsecciones (opcional) · Carruseles  
- **Cerámica / Ilustraciones / Pintura** → Piezas · Subsecciones (opcional)  
- **Exhibiciones · Inicio · About · Ajustes**

She only fills **Spanish**. Use document action **Traducir al inglés** after saving (needs `SANITY_API_WRITE_TOKEN`). English fields stay hidden in Studio; the public site still has ES/EN.

## GitHub + Vercel (her ownership)

1. She creates an empty GitHub repo.
2. From this folder:

```bash
git remote add origin git@github.com:HER_USER/REPO.git
git add .
git commit -m "Initial VIVI site"
git push -u origin main
```

3. Import the repo in **her** Vercel account and add the env vars above.
4. Point her domain to Vercel when ready.

## Contacts (defaults in Ajustes)

- WhatsApp: +51 954 734 273
- Instagram: [@vivitallerdearte](https://www.instagram.com/vivitallerdearte/)
- Email: viviartistryimagination@gmail.com
- Maps: https://maps.app.goo.gl/v8RWC44eAsGuxLNq9

## Content model notes

- Prices in **soles (S/)** only
- Piece status: Disponible / Vendido / Oculto
- Jewelry: Mujer / Hombre + optional tipo → subtipo
- Other categories: optional subsections
- Cart → WhatsApp prefilled message (language follows site locale)
