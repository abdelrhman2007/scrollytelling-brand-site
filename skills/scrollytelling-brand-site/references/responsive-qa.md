# Responsive QA

Run this audit before calling any milestone done, at these sizes: **320×568, 390×844, 768×1024, 1024×768, 1280×800, 1440×900 and 1920×1080**.

## Automated audit (Playwright `browser_run_code_unsafe`)
```js
async (page) => {
  const out = {};
  for (const [w, h] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000'); await page.waitForTimeout(4500);
    out[w] = await page.evaluate(() => {
      const W = innerWidth, vis = e => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden'; };
      const tiny = new Set();
      for (const el of document.querySelectorAll('main *, footer *, header *')) {
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || !vis(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12) tiny.add(`${fs.toFixed(1)}px "${el.textContent.trim().slice(0,20)}"`);
      }
      const small = [...document.querySelectorAll('a, button')].filter(e => { const r = e.getBoundingClientRect(); return vis(e) && r.width && (r.height < 40 || r.width < 40) && !e.closest('#site-menu'); }).length;
      return { overflowX: document.documentElement.scrollWidth > W, tinyText: [...tiny].slice(0, 8), smallTargets: small };
    });
  }
  return out;
}
```
Elements that are *meant* to overflow (marquees, the horizontal track, pans, decorative SVGs) will show up as spill. Judge those by eye.

## Visual pass
Take screenshots at **390 and 768** of: the hero top, hero mid-scroll, mission, process, the services 3D at service 1 and the last service, a case study, contact and the finale. Combine them into one contact sheet with Pillow and look at it as a whole.

## Rules learned
- **Pixel or monospace label fonts must be ≥ 0.75rem.** For sizes relative to a big headline, use `max(0.75rem, 0.4em)`.
- **Touch targets ≥ 44px:** the logo button, rail chips, social pills and lightbox controls.
- **HUDs and stat panels:** on ≤ 400px screens, show only the 2 lines that tell the story.
- **3D on portrait screens:** use a vertical view offset plus a camera distance fitted to the aspect (see `3d-print-scenes.md`). Check that the model isn't cropped and doesn't sit under the headline.
- **Pinned desktop experiences:** horizontal tracks, split panels and sticky stages become stacked or vertical layouts below 900px, and also under reduced motion.
- **Mobile header:** add a soft gradient backdrop so text never collides with it. On light (paper or yellow) sections, the header switches tone through `appStore.headerTone`.
- **Phone headlines:** use `clamp()` with a vw middle value and `white-space: nowrap` lines of about 16 characters or fewer.
- **Content checks:** test with the CMS data, not just the local models. Long titles and missing images or photos (show initials) must look intentional.
- **Reduced motion:** `emulateMedia({ reducedMotion: 'reduce' })`. All text must be visible, the model shown finished, and no pins.
