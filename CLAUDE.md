# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200/
npm run build      # Production build → dist/
npm run watch      # Watch mode build (development)
npm test           # Run unit tests with Vitest
```

Angular CLI is also available via `npm run ng` (e.g., `npm run ng generate component foo`).

## Architecture

**Angular 21 standalone components** — no NgModules. Every component, directive, and pipe uses `standalone: true` and imports its own dependencies.

### Layer structure

| Layer | Path | Purpose |
|---|---|---|
| Core | `src/app/core/` | Global UI (Header, Footer, FloatingWhatsappButton, FloatingBookingButton, CookieConsent) and services (LanguageService, CanonicalService) |
| Features | `src/app/features/` | Self-contained feature areas (home, treatments, blog, booking-form, faq, espacio-cbm, seo-pages, etc.) |
| Pages | `src/app/pages/` | Full-page route targets (e.g., DisplayComponent for kiosk/clinic screens) |
| Sections | `src/app/sections/` | Reusable cross-feature sections (PricingComponent) |
| Shared | `src/app/shared/` | Directives and utilities used across features (RevealOnScrollDirective) |

### Root app (`app.ts`)

- Manages a CSS custom property `--scroll-progress` via rAF-throttled scroll listener
- Suppresses scroll tracking on the `/display` route
- Injects `CanonicalService` at startup to manage `<link rel="canonical">` tags

### Routing (`app.routes.ts`)

Routes are lazy-loaded. The `/display/:orientation` route renders a kiosk view (used on physical clinic display screens). SEO landing pages (`/fisioterapia-dolor-lumbar-terrassa`, etc.) all share `SeoPageComponent`.

### Key services

- **LanguageService** — switches UI language between `es`, `ca`, `en` via Google Translate integration
- **CanonicalService** — sets canonical URL on route changes; base domain is `https://cbmfisioterapia.com`

### Shared directive

- **RevealOnScrollDirective** (`shared/`) — IntersectionObserver-based scroll reveal; respects `prefers-reduced-motion`

## Tech stack

- Angular 21 + RxJS 7
- TypeScript 5.9 (strict mode, strict templates)
- Vitest + jsdom for unit tests
- Prettier (100-char width, single quotes, Angular HTML parser)
- Deployed on Netlify (`public/_redirects`)

## SEO & metadata

Structured data (JSON-LD for `LocalBusiness`/`MedicalBusiness`/`Physiotherapy`) lives in `src/index.html`. Canonical tags are managed dynamically by `CanonicalService`.