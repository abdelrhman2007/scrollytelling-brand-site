# Performance: budgets, measurement, fixes

Measure only on a **production build** (`rm -rf .next && next build && next start`). Before every measurement, confirm the server serves the build you just made:
```bash
[ "$(curl -s localhost:3000 | grep -o 'layout-[a-f0-9]*\.js' | head -1)" = "$(ls .next/static/chunks/app/ | grep -o 'layout-[a-f0-9]*\.js')" ] && echo "server matches build"
```
A leftover `next-server` process once served an old build and produced wrong numbers. Run `pkill -f next-server` before restarting.

## Budgets (achieved in the reference build)
| Metric | Target | Reference result |
|---|---|---|
| Draw calls per frame while scrolling the hero | < 20 | 17 (from 637) |
| Draw calls while idle | 0 | 0 (from 38.5k/s) |
| Idle CPU, page still | < 2% | 0.6% top, 1.7% bottom (from 6–8%) |
| rAF callbacks/s while idle | ≈ 0–5 | 4 (from 64) |
| Scroll smoothness | 60 fps, p95 ≤ 18 ms, 0 frames > 34 ms | 60 / 17.5 / 0, desktop and phone |
| Elements with `will-change` | ~0 | 1 (from 104) |
| Live WebGL canvases far down the page | 0 | 0 |
| First-load JS for Home | ≤ ~185 KB | 180–186 KB (three.js lazy) |

## Measurement scripts (Playwright `browser_run_code_unsafe`)
**Draw calls:** patch the WebGL draw functions.
```js
let calls = 0;
for (const C of [WebGLRenderingContext, WebGL2RenderingContext]) for (const m of ['drawElements','drawArrays']) {
  const o = C.prototype[m]; C.prototype['__'+m] ??= o;
  C.prototype[m] = function (...a) { calls++; return C.prototype['__'+m].apply(this, a); };
}
// idle: calls = 0; wait 2 s → read calls. Scrolling: step scrollTo + rAF, divide by frames.
```
**Idle CPU** (CDP):
```js
const cdp = await page.context().newCDPSession(page); await cdp.send('Performance.enable');
const m = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
const a = await m(); await page.waitForTimeout(3000); const b = await m();
const idleCpuPct = (b.TaskDuration - a.TaskDuration) / 3 * 100;
```
**Who keeps the page awake:** wrap `requestAnimationFrame` and count `new Error().stack` together with `cb.toString().slice(0,120)` per caller over 2 s. This is how the ScrollTrigger keep-alive loop `function e(){return eA&&requestAnimationFrame(e)}` was found.

**Smoothness:** drive `scrollTo` from a rAF loop over 8–14 s and collect frame deltas, then compute the average fps, p95 and the count of frames over 34 ms.

**Memory:** `performance.memory.usedJSHeapSize`, plus the number of `canvas` elements at the top, bottom and back at the hero.

**Visible lazy loading:** check in the **real browser pane**, not headless (see SKILL.md gotchas).

## Fixes that worked (in commit order)
1. **3D:**
   - Bake to one geometry.
   - `frameloop="demand"`, with invalidation from scroll and pointer.
   - Remove clock-driven orbits.
   - Adaptive DPR, DPR capped at 1.5, a 1024 shadow map.
   - Lazy-load the GLTF path and drop drei.
2. **Paint:**
   - Remove every CSS `will-change`; GSAP promotes elements only while it animates them.
   - Make the film grain a static tiled SVG noise with `contain: strict`. It used to be a 2880×1800 layer animating forever.
3. **Fonts:** load only the weights and styles actually used, and `preload: false` for fonts that first appear mid-page.
4. **Delivery:**
   - WebP only (AVIF encoding on demand cost seconds of CPU).
   - 30-day cache for `/images/*` and optimised images.
   - `removeConsole` and `poweredByHeader: false`.
   - A shorter preloader.
   - `ScrollTrigger.config({ ignoreMobileResize: true })`.
5. **Idle:**
   - Lenis sleeps when still and wakes on intent.
   - Skip ScrollTrigger's Firefox keep-alive loop elsewhere.
   - Mount canvases only near the viewport, and unmount them when far.
   - `content-visibility: auto` on long sections that have explicit heights.

## Don'ts
- No infinite CSS or JS animations (pulses only while a state is active).
- No `will-change` in stylesheets. No `setInterval` UI.
- No GSAP tween per frame for things CSS transitions can do (slide crossfades).
- No new npm dependencies without a reason. Check the bundle after adding any.
- Don't lower quality on phones to "optimise". Make the work conditional instead (render on demand, mount near, adaptive DPR).
