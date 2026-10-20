# 3D print scenes ("layer by layer")

## The print kit (`core/three/printKit.ts`)
Two clipping planes split any geometry at height `h`:
- **below `h`:** a solid paper-white material (`MeshStandardMaterial`, `clippingPlanes:[below]`, `clipShadows`).
- **at `h`:** the same geometry with a `BackSide` `MeshBasicMaterial` in the brand yellow. Through the cut, back faces show as a "molten layer" cap at almost no cost.
- **above `h`:** `LineBasicMaterial` outlines in the blueprint blue, clipped with `[above]`, which gives the ghost wireframe.
- **solid outlines:** faint navy lines below `h` give a maquette edge look.

Call `kit.setHeight(h)` per frame. The renderer needs `gl.localClippingEnabled = true`.

## Bake everything (`core/three/bakeParts.ts`)
**Never render one mesh per part.** `bakeParts(parts)` turns all parts into ONE solid geometry plus ONE outline geometry. It applies each part's position and rotation, makes geometries non-indexed, keeps only position and normal, and merges with `mergeGeometries`. A whole city went from **637 draw calls per frame to 17**.

`<Printable kit geometry outline/>` then renders 4 objects: solid, cap, solid edges and ghost edges.

## The canvas pattern (hero, process, services)
```tsx
<Canvas
  shadows="percentage"                 // same quality on every device
  dpr={[1, 1.5]}                       // cap; adaptive step-down below
  frameloop={active ? "demand" : "never"}
  gl={{ antialias: true, alpha: true, powerPreference: "default", stencil: false }}
  onCreated={({ gl }) => { gl.localClippingEnabled = true; gl.toneMapping = THREE.ACESFilmicToneMapping; }}
/>
```
- **Render on demand.** The scroll controller writes `state.current.progress` and calls `state.current.invalidate?.()`; pointer moves also call `invalidate()`. Inside `useFrame`, ease toward the target, snap when you're within a threshold, and call `three.invalidate()` **only while something is still moving**. Idle means 0 draw calls.
- **No time-based motion.** Drive turntables, head paths and orbits from scroll progress, not `clock.elapsedTime`. Anything clock-driven forces continuous rendering.
- **Clamp `dt`.** Use `Math.min(rawDt, 1/20)`: the first frame after an idle pause has a huge delta.
- **Adaptive DPR.** Count frames slower than 1/40 s; after more than 20 in a row, call `setDpr(1)`.
- **Mount near, render on screen.** Mount with `useInView(section, "100% 0px 100% 0px")` and render with `useInView(stage, "0px")`. Unmounting frees the WebGL context and GPU memory while the visitor reads the rest of the page.
- **Resume, don't replay.** Initialise the smoothed progress from the current target, and copy the camera to its desired position on the first frame. Scrolling back must not re-print the model or fly the camera in.
- **Always wrap the canvas in `<WebGLGuard>`.** It checks WebGL support and catches render errors, falling back to the blueprint background. Dynamically import canvases with `{ ssr: false }`.

## Framing per aspect ratio
```ts
const aspect = size.width / size.height;
if (aspect > 1.15) cam.setViewOffset(w, h, -w * 0.17, h * 0.02, w, h);       // landscape: model right of copy
else if (aspect < 0.95) cam.setViewOffset(w, h, 0, -h * 0.14, w, h);        // portrait: model lower (hero) / upper (services: +0.2)
else cam.clearViewOffset();
cam.position.z = aspect < 0.95 ? Math.min(19, 8.2 / aspect) : 9.2;           // fit narrow horizontal FOV
```
**Always check at 390×844 and 768×1024**; portrait screens are where models get cropped.

## Procedural model recipes (`modules/capabilities/view/scene/serviceModels.ts`)
Each model is a function that returns `PartSpec[]`, built from `BoxGeometry`, `CylinderGeometry`, `ExtrudeGeometry` (rounded rects, gears with holes, triangular gussets), `LatheGeometry` (vases and lamps with a twisted, ribbed vertex displacement) and `IcosahedronGeometry` (trees). Then normalise it: centre on X/Z, sit it at y = 0, and scale it to fit a width and height box.

- Design and engineering: an L-bracket with gussets, hex bolts and a boss.
- Architecture: a twisting tower (per-floor rotation) on a podium with trees.
- Prototype: a rounded device enclosure with a screen, buttons, port and antenna.
- 3D printing: a spiral-ribbed lathe lamp.
- Batch manufacturing: a 3×3 grid of identical extruded gears.
- PCB: a board with low trace boxes, MCU, capacitors, SMD parts, a pin header and USB-C.
- Generic fallback: stacked boxes.

Map a CMS service to a model **by slug, then by keyword**, so services added later still get a sensible model. Use `mulberry32(seed)` for deterministic randomness.

## The hero scene extras
- **Gantry:** rails, a bridge that rides Z and a yellow head that rides X. The head follows a Lissajous path that moves *only while printing*: `t += dt·activity`.
- **Glow:** a yellow point light at the nozzle with intensity driven by activity.
- **Layer ring:** a `lineLoop` at the current layer height.
- **Lighting:** ambient, hemisphere, a key directional light with a 1024px shadow map and tight shadow-camera bounds, a yellow rim light and the nozzle point light.
- **Custom model:** if a client provides a real model, `GLBMaquette` (lazy) loads it with `useLoader(GLTFLoader)`, bakes all its meshes and normalises them onto the bed. The procedural model is only a stand-in.

## Budgets
- Under 20 draw calls per frame while scrolling.
- 0 draw calls when idle.
- At most 2 live canvases at any scroll position (the hero, plus one near the viewport).
- Shadow map 1024. DPR at most 1.5.
