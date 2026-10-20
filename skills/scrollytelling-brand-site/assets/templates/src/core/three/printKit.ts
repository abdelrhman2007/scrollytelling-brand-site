import * as THREE from "three";
import { brand } from "@/core/config/brand";

/**
 * The "print kit": two clipping planes that split any model at a height `h`.
 *
 *  - below `h` → solid, paper-white maquette (the printed part)
 *  - at `h`    → back faces show through the cut in hot yellow — reads as
 *                the freshly-deposited layer (a cheap, convincing cap)
 *  - above `h` → blueprint wireframe ghost (the part still to be printed)
 *
 * Any geometry — procedural or a loaded GLB — can be dropped into it.
 */
export type PrintKit = ReturnType<typeof createPrintKit>;

export function createPrintKit(opts?: { solidColor?: string; ghostColor?: string }) {
  const below = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const above = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const materials = {
    solid: new THREE.MeshStandardMaterial({
      color: opts?.solidColor ?? brand.colors.paper,
      roughness: 0.72,
      metalness: 0.02,
      clippingPlanes: [below],
      clipShadows: true,
      side: THREE.FrontSide,
    }),
    cap: new THREE.MeshBasicMaterial({
      color: brand.colors.yellow,
      clippingPlanes: [below],
      side: THREE.BackSide,
    }),
    solidEdges: new THREE.LineBasicMaterial({
      color: brand.colors.navy800,
      transparent: true,
      opacity: 0.22,
      clippingPlanes: [below],
    }),
    ghostEdges: new THREE.LineBasicMaterial({
      color: opts?.ghostColor ?? brand.colors.blueprint,
      transparent: true,
      opacity: 0.6,
      clippingPlanes: [above],
      depthWrite: false,
    }),
  };

  return {
    below,
    above,
    materials,
    /** Move the print head to world height `h`. */
    setHeight(h: number) {
      below.constant = h;
      above.constant = -h;
    },
    dispose() {
      Object.values(materials).forEach((m) => m.dispose());
    },
  };
}

/** Edge lines for the blueprint/solid outlines. Cached per geometry. */
const edgeCache = new WeakMap<THREE.BufferGeometry, THREE.EdgesGeometry>();
export function edgesOf(geo: THREE.BufferGeometry, threshold = 20) {
  let e = edgeCache.get(geo);
  if (!e) {
    e = new THREE.EdgesGeometry(geo, threshold);
    edgeCache.set(geo, e);
  }
  return e;
}

/** Deterministic PRNG so the procedural maquette is identical on every load. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
