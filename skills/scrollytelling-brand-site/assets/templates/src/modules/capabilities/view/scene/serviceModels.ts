import * as THREE from "three";
import { bakeParts, type PartSpec } from "@/core/three/bakeParts";
import { mulberry32 } from "@/core/three/printKit";
import type { ModelKind } from "../../model/capabilities.model";

/**
 * Procedural, print-ready models — one per service. Each is baked to a single
 * geometry (4 draw calls) and normalised onto the turntable, so any of them
 * can be "printed" by the shared clip-plane kit.
 */

const FIT_WIDTH = 3.0;
const FIT_HEIGHT = 2.3;

export type BakedModel = { solid: THREE.BufferGeometry; outline: THREE.BufferGeometry; height: number };

export function buildModel(kind: ModelKind): BakedModel {
  const parts = BUILDERS[kind]();
  const baked = bakeParts(parts);
  new Set(parts.map((p) => p.geometry)).forEach((g) => g.dispose());

  // Normalise: centred on X/Z, sitting on y = 0, fitted to the turntable.
  const size = baked.bounds.getSize(new THREE.Vector3());
  const center = baked.bounds.getCenter(new THREE.Vector3());
  const scale = Math.min(FIT_WIDTH / Math.max(size.x, size.z), FIT_HEIGHT / size.y);
  const m = new THREE.Matrix4()
    .makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -baked.bounds.min.y, -center.z));
  baked.solid.applyMatrix4(m);
  baked.outline.applyMatrix4(m);
  return { solid: baked.solid, outline: baked.outline, height: size.y * scale };
}

/* ------------------------------------------------------------------ helpers */

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
const cyl = (rt: number, rb: number, h: number, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg).translate(0, h / 2, 0);

/** Extrude a 2D shape upwards (shape XY → ground XZ, extrusion → +Y). */
const extrudeUp = (shape: THREE.Shape, depth: number, bevel = 0) =>
  new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 16,
  }).rotateX(-Math.PI / 2);

const roundedRect = (w: number, d: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const part = (geometry: THREE.BufferGeometry, x = 0, y = 0, z = 0, rotationY = 0, edgeThreshold?: number): PartSpec => ({
  geometry,
  position: [x, y, z],
  rotationY,
  edgeThreshold,
});

/* ----------------------------------------------------------------- builders */

const BUILDERS: Record<ModelKind, () => PartSpec[]> = {
  /** Design & Engineering — an engineered L-bracket, the archetypal CAD part. */
  design() {
    const parts: PartSpec[] = [];
    parts.push(part(box(2.6, 0.22, 1.8)));
    parts.push(part(box(2.6, 1.6, 0.24), 0, 0.22, -0.78));
    const gusset = new THREE.Shape();
    gusset.moveTo(0, 0);
    gusset.lineTo(1.1, 0);
    gusset.lineTo(0, 1.25);
    gusset.closePath();
    for (const x of [-0.95, 0.95]) {
      // Triangle in the YZ plane: extrude along X.
      const g = new THREE.ExtrudeGeometry(gusset, { depth: 0.18, bevelEnabled: false }).rotateY(-Math.PI / 2);
      parts.push(part(g, x + 0.09, 0.22, -0.66));
    }
    for (const [x, z] of [[-0.95, 0.5], [0.95, 0.5], [-0.35, 0.55], [0.35, 0.55]]) {
      parts.push(part(cyl(0.17, 0.17, 0.1, 6), x, 0.22, z, 0, 30)); // hex bolt heads
    }
    const boss = cyl(0.36, 0.36, 0.3, 32).rotateX(Math.PI / 2).translate(0, -0.15, 0);
    parts.push(part(boss, 0, 1.15, -0.5, 0, 40));
    const shaft = cyl(0.16, 0.16, 1.1, 24).rotateX(Math.PI / 2).translate(0, -0.55, 0);
    parts.push(part(shaft, 0, 1.15, -0.2, 0, 40));
    return parts;
  },

  /** Architectural Maquettes — a twisting tower on a podium, with landscape. */
  maquette() {
    const rand = mulberry32(11);
    const parts: PartSpec[] = [part(box(3.2, 0.06, 3.2)), part(box(2.0, 0.28, 2.0), 0, 0.06)];
    const floors = 20;
    for (let i = 0; i < floors; i++) {
      const w = 1.15 - i * 0.012;
      parts.push(part(box(w, 0.085, w), 0, 0.34 + i * 0.115, 0, i * 0.075));
    }
    parts.push(part(cyl(0.28, 0.28, floors * 0.115, 16), 0, 0.34, 0, 0, 40));
    parts.push(part(cyl(0.02, 0.02, 0.45, 6), 0, 0.34 + floors * 0.115, 0));
    const crown = new THREE.IcosahedronGeometry(0.12, 0).translate(0, 0.24, 0);
    const trunk = cyl(0.015, 0.02, 0.16, 5);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rand() * 0.2;
      const r = 1.3 + rand() * 0.15;
      parts.push(part(trunk, Math.cos(a) * r, 0.06, Math.sin(a) * r));
      parts.push(part(crown, Math.cos(a) * r, 0.06, Math.sin(a) * r, rand() * Math.PI, 1));
    }
    return parts;
  },

  /** Prototyping — a handheld device enclosure, like the ECU Soft project. */
  prototype() {
    const parts: PartSpec[] = [];
    parts.push(part(extrudeUp(roundedRect(1.7, 2.6, 0.28), 0.42, 0.05)));
    parts.push(part(box(1.25, 0.06, 0.7), 0, 0.5, -0.65)); // screen bezel
    parts.push(part(box(1.05, 0.03, 0.52), 0, 0.56, -0.65)); // glass
    const button = cyl(0.11, 0.12, 0.12, 20);
    for (const [x, z] of [[0, 0.1], [-0.38, 0.45], [0.38, 0.45], [0, 0.45], [0, 0.8], [-0.5, 0.95], [0.5, 0.95]]) {
      parts.push(part(button, x, 0.47, z, 0, 40));
    }
    parts.push(part(box(0.35, 0.16, 0.12), 0.4, 0.15, -1.33)); // USB port block
    parts.push(part(cyl(0.035, 0.05, 0.55, 10), -0.62, 0.47, -1.05, 0, 40)); // antenna
    return parts;
  },

  /** 3D Printing — a spiral-ribbed lamp, impossible to make any other way. */
  printing() {
    const H = 2.6;
    const T = 0.06;
    const profile = (y: number) => {
      const t = y / H;
      return 0.42 + 0.55 * Math.sin(Math.PI * (0.15 + t * 0.75)) * (1 - 0.25 * t);
    };
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, 0)];
    const N = 70;
    for (let i = 0; i <= N; i++) pts.push(new THREE.Vector2(profile((i / N) * H), (i / N) * H));
    for (let i = N; i >= 2; i--) pts.push(new THREE.Vector2(Math.max(0.05, profile((i / N) * H) - T), (i / N) * H));
    pts.push(new THREE.Vector2(0, (2 / N) * H));
    const lamp = new THREE.LatheGeometry(pts, 96);
    const pos = lamp.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (Math.hypot(v.x, v.z) < 1e-4) continue;
      const a = Math.atan2(v.z, v.x);
      const k = 1 + 0.1 * Math.sin(a * 12 + v.y * 3.6);
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
    lamp.computeVertexNormals();
    return [part(cyl(0.75, 0.85, 0.1, 48), 0, 0, 0, 0, 40), part(lamp, 0, 0.1, 0, 0, 40)];
  },

  /** Small-batch Manufacturing — nine identical gears off the same bed. */
  batch() {
    const gear = (teeth: number, rOuter: number, rRoot: number, hole: number) => {
      const s = new THREE.Shape();
      const step = (Math.PI * 2) / teeth;
      for (let i = 0; i < teeth; i++) {
        const a = i * step;
        const pts: [number, number][] = [
          [rRoot, a],
          [rOuter, a + step * 0.2],
          [rOuter, a + step * 0.5],
          [rRoot, a + step * 0.7],
        ];
        pts.forEach(([r, ang], j) => {
          const x = Math.cos(ang) * r;
          const y = Math.sin(ang) * r;
          if (i === 0 && j === 0) s.moveTo(x, y);
          else s.lineTo(x, y);
        });
      }
      s.closePath();
      const h = new THREE.Path();
      h.absarc(0, 0, hole, 0, Math.PI * 2, true);
      s.holes.push(h);
      return extrudeUp(s, 0.22);
    };
    const g = gear(14, 0.48, 0.38, 0.14);
    const hub = cyl(0.2, 0.2, 0.34, 24);
    const parts: PartSpec[] = [part(box(3.3, 0.05, 3.3))];
    for (let ix = -1; ix <= 1; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        parts.push(part(g, ix * 1.08, 0.05, iz * 1.08, (ix + iz) * 0.2, 30));
        parts.push(part(hub, ix * 1.08, 0.05, iz * 1.08, 0, 40));
      }
    }
    return parts;
  },

  /** PCB Design — a populated board: traces first, then the components. */
  pcb() {
    const rand = mulberry32(5);
    const parts: PartSpec[] = [part(box(3.4, 0.08, 2.3))];
    const T = 0.08;
    // Traces (low, so they print with the board)
    for (let i = 0; i < 14; i++) {
      const len = 0.5 + rand() * 1.2;
      const horizontal = i % 2 === 0;
      const x = (rand() - 0.5) * 2.4;
      const z = (rand() - 0.5) * 1.6;
      parts.push(part(box(len, 0.012, 0.04), x, T, z, horizontal ? 0 : Math.PI / 2));
    }
    parts.push(part(box(0.7, 0.1, 0.7), -0.2, T, 0.05)); // MCU
    parts.push(part(box(0.5, 0.012, 0.5), -0.2, T + 0.1, 0.05));
    parts.push(part(box(0.38, 0.08, 0.26), 0.9, T, -0.55)); // regulator
    parts.push(part(box(0.3, 0.07, 0.3), 0.85, T, 0.45));
    const cap = cyl(0.07, 0.07, 0.24, 16);
    for (const [x, z] of [[0.5, -0.1], [0.55, 0.2], [-0.9, -0.6], [-1.05, -0.6], [1.3, 0.1]]) parts.push(part(cap, x, T, z, 0, 40));
    const smd = box(0.12, 0.04, 0.06);
    for (let i = 0; i < 10; i++) parts.push(part(smd, -1.3 + (i % 5) * 0.16, T, 0.55 + Math.floor(i / 5) * 0.16));
    const pin = box(0.05, 0.28, 0.05);
    for (let i = 0; i < 10; i++) parts.push(part(pin, -1.2 + i * 0.13, T, -0.95));
    parts.push(part(box(1.4, 0.08, 0.12), -0.62, T, -0.95));
    parts.push(part(box(0.45, 0.22, 0.36), 1.45, T, -0.15)); // USB-C
    return parts;
  },

  /** Any service added in the CMS without a dedicated model. */
  generic() {
    return [part(box(2.4, 0.25, 2.4)), part(box(1.6, 0.9, 1.6), 0, 0.25), part(box(0.9, 1.0, 0.9), 0, 1.15, 0, Math.PI / 4)];
  },
};
