# LocalReach AI — Setup

## 1. Instalare dependențe

```bash
npm install
```

## 2. Variabile de mediu

Completează `.env.local` cu:

```
NEXT_PUBLIC_SUPABASE_URL=        # din Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # din Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=       # din Supabase → Settings → API

ANTHROPIC_API_KEY=               # console.anthropic.com
GOOGLE_MAPS_API_KEY=             # console.cloud.google.com (activează Places API)

STRIPE_SECRET_KEY=               # dashboard.stripe.com
STRIPE_WEBHOOK_SECRET=           # stripe listen --forward-to localhost:3000/api/webhooks/stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 3. Baza de date Supabase

Rulează migrația în Supabase SQL Editor:

```
supabase/migrations/001_initial.sql
```

Sau folosind CLI:
```bash
npx supabase db push
```

## 4. Pornire dev server

```bash
npm run dev
```

Aplicația rulează la `http://localhost:3000`.

## 5. Deploy pe Vercel

```bash
npx vercel --prod
```

Adaugă toate variabilele de mediu în Vercel Dashboard → Settings → Environment Variables.

---

## Structura proiectului

- `app/(auth)/` — Login & Signup
- `app/(dashboard)/` — Toate paginile protejate
- `app/api/` — API Routes (search, analyze, hooks, campaigns, prospects)
- `components/` — Componente React reutilizabile
- `lib/` — Clienți Supabase, Anthropic, Google Maps
- `types/` — TypeScript types
- `supabase/migrations/` — SQL schema
