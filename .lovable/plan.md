

# Plateforme BTP & Services Guadeloupe — Adaptation Plan

I found the source code in `https://github.com/yd077/plateforme-btp-guada.git`. It's a React 19 single-page app generated from Google AI Studio (single `App.tsx` of ~1500 lines using local `view` state for navigation). I'll adapt it to this project's stack (TanStack Start + Tailwind v4) with the same design system, sections, and flows — but split into proper file-based routes.

## What gets built

**Concept**: A premium marketplace connecting people in Guadeloupe (homeowners, businesses, agencies) with verified BTP artisans (masonry, electricity, plumbing, painting, landscaping, etc.).

### Routes (TanStack Start)

| File | URL | Purpose |
|---|---|---|
| `src/routes/index.tsx` | `/` | Homepage: hero slideshow, search bar, KPIs counter, featured trades, value props, CTA |
| `src/routes/recherche.tsx` | `/recherche` | Artisan search results grid with filters (specialty, location, rating) |
| `src/routes/artisan.$id.tsx` | `/artisan/:id` | Artisan profile: portfolio, reviews, certifications, "Contacter" CTA |
| `src/routes/contact-artisan.$id.tsx` | `/contact-artisan/:id` | Quote request form to a specific artisan |
| `src/routes/projet.tsx` | `/projet` | 3-step project submission wizard (type → details → contact) |
| `src/routes/succes.tsx` | `/succes` | Confirmation page after booking/submission |

Plus shared layout components in `src/components/site/` (Header, Footer, Logo, HeroSlideshow, CountUp, Reveal animation wrapper, ArtisanCard).

### Design system (in `src/styles.css`)

Imported via Tailwind v4 `@theme`:
- **Colors**: emerald `#065F46`, midnight `#0F172A`, azure `#3B82F6`, soft-white `#F8FAFC`, gold `#D4AF37`
- **Fonts**: Inter (body), Cormorant Garamond (headings, serif), Bebas Neue (KPI counters) — loaded from Google Fonts
- **Effects**: Ken Burns hero animation, glass morphism cards, shimmer hover, premium shadows, reveal-on-scroll

### Homepage sections

1. Sticky transparent header that turns solid on scroll
2. Full-screen hero with rotating slideshow + headline "L'excellence du chantier en Guadeloupe" + search bar (specialty + location)
3. KPI band: animated counters (artisans vérifiés, chantiers réalisés, communes couvertes, satisfaction)
4. Trades grid (Maçonnerie, Électricité, Plomberie, Peinture, Paysagisme, Architecture d'intérieur…)
5. "Comment ça marche" 3-step explainer
6. Featured artisans carousel (6 mock profiles from the original)
7. Dual CTA: "Soumettre un projet" / "Devenir artisan partenaire"
8. Footer with contact, legal, social

### Mock data

I'll inline the 6 mock artisans from the source (Jean-Pierre Durand, Marie-Line Gauthier, Sébastien Hoarau, Lucie Belrose, Thomas Valery, Karine Desrosiers) in `src/data/artisans.ts` — used by the search and profile routes.

### Navigation

`<Link to="...">` from `@tanstack/react-router` everywhere — replacing the original's `setView('search')` state-based navigation. Each route gets its own `head()` with unique title/description for SEO.

### Dependencies to add

- `motion` (Framer Motion v12, used by the original for animations)
- `lucide-react` (already used in original — Search, MapPin, Upload, ChevronRight, CheckCircle2, Star, etc.)

### What I'm NOT including

- `@google/genai` and the Express server from the original `package.json` — they aren't used in the UI code, no Gemini features visible. If you want AI features later (e.g., AI project description helper), I'll add them via Lovable AI Gateway.
- No backend/auth yet — all data is mock. We can wire Lovable Cloud (database for artisans, auth for clients/artisans, storage for portfolio photos) in a follow-up step.

## Technical notes

- Replace `src/routes/index.tsx` placeholder entirely
- Convert single-file SPA `view` state machine into separate route files
- Keep all visual design 1:1 with the original (colors, fonts, hero, layout)
- All copy stays in French
- Images referenced via Unsplash URLs from the original mock data
- Per-route `head()` meta with og:image set to each page's hero image

## Follow-ups (after approval)

1. Wire Lovable Cloud: artisans table, reviews table, project submissions table
2. Add auth (clients vs artisans roles via separate `user_roles` table)
3. Storage bucket for artisan portfolio photos
4. Email notifications on quote requests

Approve this plan and I'll switch to default mode and build it.

