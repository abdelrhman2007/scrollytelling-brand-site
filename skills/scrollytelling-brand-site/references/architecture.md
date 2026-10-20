# Architecture

## Stack
- **Next.js 15 (App Router) + React 19 + TypeScript.** Server components are used for pages and CMS fetches; sections are client components.
- **GSAP 3 + ScrollTrigger + `@gsap/react` (`useGSAP`)** for all choreography. **Lenis** provides smooth scroll, driven by the GSAP ticker.
- **three + @react-three/fiber** (no drei: it costs bundle size and you don't need it). GLTF is loaded with three's own `GLTFLoader` through `useLoader`, code-split.
- **CSS Modules** with brand tokens on `:root`. No Tailwind, no UI kit.
- **Fonts via `next/font/google`.** Load only the weights you actually use.

## Folder tree
```
src/
├─ app/                       composition roots only
│  ├─ layout.tsx              fonts, metadata, JSON-LD, skip link, <SmoothScroll><RouteEffects/>{children}</SmoothScroll>, grain
│  ├─ page.tsx                Home: <Preloader/><Shell/><main id="main">…modules…</main><Finale/>   (async; getContent())
│  ├─ about/ works/ works/[slug]/   inner pages: <Shell/> <PageReady/> modules <Finale/>
│  ├─ [slug]/ (+ /vcard)      private QR contact cards at root addresses
│  ├─ robots.ts sitemap.ts not-found.tsx icon.png apple-icon.png opengraph-image.jpg
├─ core/                      shared kernel — the ONLY thing modules may import from each other
│  ├─ config/  brand.ts (colours, logo paths) · site.ts (siteSections, sitePages, url) · contact.ts (fallback)
│  ├─ content/ types.ts (mirror of the CMS contract) · cms.ts (getContent/getCard) · projects.ts (shared catalogue) · vcard.ts · cards.ts
│  ├─ store/   createStore.ts (useSyncExternalStore) · appStore.ts (ready, menuOpen, lenis, activeSection, headerTone)
│  ├─ providers/ SmoothScroll (sleeping Lenis) · PageReady · RouteEffects
│  ├─ lib/     gsap.ts (plugins, defaults, keep-alive skip, media queries) · cn.ts (cn, pad)
│  ├─ hooks/   useInView · useReveal
│  ├─ three/   printKit · bakeParts · Printable · WebGLGuard
│  └─ ui/      PixelTag · Dots · SectionLabel · SplitWords (+ ui.module.css)
└─ modules/<name>/
   ├─ model/<name>.model.ts   copy, images, types — the local fallback content
   ├─ model/<name>.cms.ts     CMS slice → model mapper (returns null to keep the local model)
   ├─ controller/use<Name>Controller.ts   refs, state, useGSAP choreography, event handlers
   ├─ view/<Name>View.tsx + <Name>.module.css   markup only, data-attributes as animation hooks
   ├─ view/scene/*.tsx         (optional) R3F canvas, dynamically imported with ssr:false
   ├─ modules/<child>/         (optional) child triad — the "H" in HMVC (e.g. works-gallery → case-study)
   └─ index.ts                 the module's only public export
```

## The rules
- **Siblings never import siblings.** Shared data goes in `core/content` (for example the project catalogue that Home, `/works` and `/works/[slug]` all need). Cross-module signals go through `appStore`: the menu, `headerTone` for light sections, `activeSection`, `ready`, and the Lenis instance.
- **Views hold no logic.** Mark animation targets with `data-*` attributes (`data-word`, `data-hl`, `data-reveal`, `data-panel`) and select them inside `useGSAP({ scope })`.
- **Every controller wraps motion in `gsap.matchMedia()`**, with `media.motion` and `media.reduce` (plus `media.desktop` / `media.mobile` where layouts differ), and returns `mm.revert()`.
- **Copy lives in models.** Mark highlights with `[[double brackets]]`. Keep model shapes equal to the CMS DTOs, so the mapper is a sort plus defaults.

## Module template
```ts
// model/example.model.ts
export const exampleModel = { index: "03", label: "How we work", title: "How an idea becomes a [[product]].", items: [/* … */] };
export type ExampleModel = typeof exampleModel;

// model/example.cms.ts
export function itemsFromCms(list?: CmsItem[] | null) { return list?.length ? [...list].sort((a, b) => a.sortOrder - b.sortOrder) : null; }

// controller/useExampleController.ts
"use client";
export function useExampleController(cms?: CmsItem[] | null) {
  const root = useRef<HTMLElement>(null);
  const model = useMemo(() => ({ ...exampleModel, items: itemsFromCms(cms) ?? exampleModel.items }), [cms]);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(media.motion, () => {
      gsap.timeline({ scrollTrigger: { trigger: "[data-head]", start: "top 75%" } })
        .from("[data-head] [data-word]", { yPercent: 100, opacity: 0, stagger: 0.05, duration: 1, ease: "expo.out" })
        .fromTo("[data-head] [data-hl]", { "--hl": 0 }, { "--hl": 1, duration: 0.6 }, "-=0.5");
    });
    return () => mm.revert();
  }, { scope: root });
  return { root, model };
}

// view/ExampleView.tsx
"use client";
export default function ExampleView({ items }: { items?: CmsItem[] | null }) {
  const { root, model } = useExampleController(items);
  return (
    <section id="example" ref={root} className={s.example}>
      <header data-head><SectionLabel index={model.index}>{model.label}</SectionLabel><h2><SplitWords text={model.title} /></h2></header>
      {/* … */}
    </section>
  );
}
// index.ts
export { default as Example } from "./view/ExampleView";
```

## Kernel highlights (in `assets/templates/src/core`)
- **`lib/gsap.ts`** registers the plugins and `ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true })`. It also contains **`skipScrollTriggerKeepAlive()`**: outside Firefox, ScrollTrigger's empty, endless `requestAnimationFrame` loop is never scheduled, which cut idle CPU from ~6% to ~0.6%. If you upgrade GSAP, recheck the regex.
- **`providers/SmoothScroll.tsx`** runs Lenis on the GSAP ticker, uses `lagSmoothing(0)`, and **sleeps after ~30 still frames**. It wakes on wheel, touch, pointer, key and scroll events, and on programmatic `lenis.scrollTo` (which is wrapped).
- **`providers/PageReady.tsx`** performs the preloader's hand-over on inner pages: unlock, `ready`, `lenis.start()`, refresh.
- **`providers/RouteEffects.tsx`** runs on every pathname change. It closes the menu, resets shell state, scrolls to the top immediately, then two frames later calls `lenis.resize()` and `ScrollTrigger.refresh()` and honours a `/#hash`. It compares pathnames instead of using a first-run flag, which keeps it StrictMode-safe.
- **`hooks/useInView.ts`** is a small IntersectionObserver hook. Use it twice per canvas: a near margin (`"100% 0px"`) to *mount*, and `"0px"` to *render*.
- **`ui/index.tsx`**: `SplitWords` splits plain copy per word, keeps each `[[highlight]]` as one unit, and glues punctuation to it (`[[hold]].`).

## CMS fallback pattern
```ts
// app/page.tsx (server)
export const revalidate = 60;
export default async function Home() {
  const cms = await getContent();               // null if CMS_URL unset, down, slow (3 s timeout) or malformed
  return <><Preloader/><Shell settings={cms?.settings}/><main id="main"><Hero/>…<Works projects={cms?.projects}/>…</main><Finale/></>;
}
```
- `getContent()` refuses to run in the browser, validates the response shape, and uses `next: { revalidate: 60 }`.
- `next.config.ts` builds `images.remotePatterns` from `CMS_URL`.
- The browser-side contact form uses `NEXT_PUBLIC_CMS_URL`. If that is unset, it falls back to WhatsApp.

## SEO and metadata set
- Layout metadata with a title template (`%s — Brand`), `metadataBase`, canonical, Open Graph and Twitter tags.
- JSON-LD (`ProfessionalService`).
- `robots.ts`, and a `sitemap.ts` that includes the dynamic project pages.
- A generated `icon.png`, `apple-icon.png` and `opengraph-image.jpg` (Pillow from the logo).
- A branded `not-found.tsx` that renders `PageReady`.
