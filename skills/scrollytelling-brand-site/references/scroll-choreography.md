# Scroll choreography: the beat catalogue

Pick 8–10 beats and map each one to the brand's story. Every beat below shipped in the reference build; see `gallery.md`.

## 1. Preloader as a brand moment
- A full-screen blueprint grid with a ghost logo. The real logo clip-reveals bottom-up (`clipPath: inset(${100-v}% 0 0 0)`) while a glowing head line rides the edge. A pixel-font counter `LAYER 000/100` and status lines change at progress thresholds.
- Minimum 1.6 s on screen, then the panel wipes up and hands over: `body[data-loading=false]`, `appStore.ready = true`, `lenis.start()`, `ScrollTrigger.refresh()`.
- It plays **once per visit, on Home only**: skip it if `ready` is already true. Inner pages render `<PageReady/>` instead.
- Lock scroll with Lenis stopped. `history.scrollRestoration = "manual"`, plus `scrollTo(0,0)`, so the story always starts at the top.

## 2. Pinned hero with phases
- Use one `ScrollTrigger.create({ trigger, start: "top top", end: "+=250%", pin: true, scrub: true })`. `onUpdate` writes `progress` into a ref the canvas reads, calls `invalidate()`, and updates the HUD text directly in the DOM (no React state per frame).
- The copy is 2–3 phases, each line in a mask: `.line { overflow: hidden; white-space: nowrap }` with `.lineInner` moved by `yPercent`. Keep lines to about 16 characters.
- **Entrance vs scroll on the same element:** the intro animates the *wrapper* (`[data-line-intro]`, `[data-cue]`) and the scroll timeline animates the *children* (`[data-line-inner]`, `[data-cue] > *`). If one property is animated by two timelines, the later one records a stale start value, and elements linger or reappear.
- Use `gsap.set(..., { yPercent: 110 })` inside `media.motion` rather than a CSS transform. Otherwise reduced-motion users get hidden text.

## 3. Kinetic statement
- Run `SplitWords` text through a scrubbed timeline: each `[data-word]` goes from `opacity 0.12, y 8` to `1, 0`, staggered. `[data-hl]` animates a CSS variable `--hl` from 0 to 1, which scales the yellow highlight box behind the word.

## 4. Split panels closing a gap
- A pinned 2-column stage. The left half starts at `xPercent: -78` and the right at `78`, and both slide to 0 together.
- An SVG sketch draws itself: set `strokeDasharray` and `strokeDashoffset` to `getTotalLength()`, then tween to 0.
- A photo reveals with a clip-path, a seam grows (`scaleY`), and the copy reveals in masks.
- **Mobile and reduced motion:** stack the halves with no pin.

## 5. Horizontal track
```ts
const distance = () => track.scrollWidth - innerWidth;
const scroller = gsap.to(track, { x: () => -distance(), ease: "none",
  scrollTrigger: { trigger: section, start: "top top", end: () => `+=${distance()}`, pin, scrub: 0.6, invalidateOnRefresh: true } });
// per-panel effects ride the horizontal motion:
gsap.to(paths, { strokeDashoffset: 0, scrollTrigger: { trigger: panel, containerAnimation: scroller, start: "left 85%", end: "left 5%", scrub: true } });
```
- **Desktop only.** Below 900 px the panels stack vertically.
- Off-screen panels can use `content-visibility: auto` with explicit sizes. But then observe the **panel** for in-view state, never a child: Chrome stops reporting intersections inside skipped content.

## 6. Pinned per-service 3D sequence
- **Pin length** is `services.length × 90%` of the viewport height. Progress p maps to a service index `i = floor(p·n)` and a local progress `t`.
- **Phases within each service:** appear (`t` 0–0.1), build (0.12–0.78, `kit.setHeight`), hold, exit (0.92–1, except the last service).
- **Copy:** each service is an `<article data-slide>` stacked in one grid cell and crossfaded with CSS transitions on `[data-active]`. That runs on the compositor, with no GSAP per frame.
- **Rail and HUD:** a numbered rail jumps to service i at `start + (end - start)·((i + 0.82)/n)`. The HUD (service, layer, status) is written directly to the DOM.
- **Reduced motion:** no pin and no canvas; list every slide.

## 7. Case studies as a child triad with a strategy map
- Each project's sticky stage is 260vh tall. A single scrubbed timeline (`start: "top top", end: "bottom bottom"`) calls `effects[project.effect](tl, q)`:
  - `zoom`: clip-path from inset to full, with the image scale going from 1.7 to 1.
  - `light`: brightness lifts and skewed blurred beams sweep across (`mix-blend-mode: screen`).
  - `turn`: two images on a turntable using `rotateY` with `perspective`.
  - `wipe`: a plan image under a model image revealed by `clipPath`, plus a scan line.
  - `pan`: a wide image translating with `xPercent`.
  - `stack`: cards fanning out like an exploded view.
- Themes are navy, paper or yellow. A light theme sets `appStore.headerTone` so the logo flips to navy.
- Add `content-visibility: auto` with `contain-intrinsic-size: auto 260vh` on each case. Turn it off under reduced motion, where the height is auto.

## 8. Marquees and cards
- Two rows move in opposite directions, driven by scrub (`xPercent` 0 to -25), never by an infinite CSS animation. One row uses an outline stroke.
- **Card images:** parallax inside a fixed frame (`yPercent` -8 to 8 at scale 1.2).

## 9. Team portraits "printed"
- Each portrait clip-reveals bottom-up with a yellow scan line, scrubbed. Portraits are grayscale and turn to colour on hover. If there's no photo, show pixel-font initials.

## 10. Form and finale
- **The form is a "New project" ticket:** type chips, live validation, honeypot, a 10 s timeout, and server RFC 7807 errors mapped to fields. Every error state offers "Send on WhatsApp instead".
- **Finale:** the logo prints again to `LAYER 100/100`, followed by the CTA, credits and back-to-top. The story closes where it began.

## Shell
- **Header:** logo, a CTA pill and a three-dot menu button. Chrome fades in after `ready`.
- **Left yellow rail:** progress `scaleY` plus the current section index.
- **Fullscreen menu:** a `clipPath` wipe, staggered items, `inert` and `aria-hidden` when closed, focus moved in and back, Esc to close. It lists pages and, on Home, the sections.
- **Custom cursor (fine pointers only):** a dot plus a lagging ring via `gsap.quickTo`, with `data-cursor="Label"` for labelled hover states. Use an `html[data-cursor-mode]` flag; don't use `data-cursor` on `html`, because it collides with the selector.

## Easing vocabulary
- `expo.out` for snaps and reveals, `power2.inOut` for mechanical "print" moves, `ease: "none"` for anything scrubbed.
- Preferred scrub values: `0.6` for most, `true` for parallax.
