# Templates — copied from the working reference build

Copy what you need into a fresh Next.js 15 app (`src/` layout, `@/*` → `src/*`), then adapt:

1. `src/core/config/brand.ts` — colours, logo paths. `site.ts` — sections, pages, URL. Add `contact.ts` with the client's fallback contacts.
2. `src/app/globals.css` — brand tokens on `:root`, `.blueprint` grid, grain, skip link.
3. `src/app/layout.tsx` — fonts (only used weights), metadata, JSON-LD.
4. Keep `src/core/lib/gsap.ts`, `providers/*`, `store/*`, `hooks/*`, `three/*`, `ui/*` as they are — they hold the hard-won performance fixes.
5. Example modules to start from: `hero` (pinned WebGL print + HUD), `capabilities` (pinned per-service 3D sequence), `about` (kinetic statement), `works-gallery` (+ child `case-study` effects), `contact-card` + `src/app/[slug]` (private QR cards).

Dependencies: `next react react-dom gsap @gsap/react lenis three @react-three/fiber` (+ `@types/three`).
Copy and image paths come from the reference project, and contacts are fictional placeholders — replace them with the client's.
