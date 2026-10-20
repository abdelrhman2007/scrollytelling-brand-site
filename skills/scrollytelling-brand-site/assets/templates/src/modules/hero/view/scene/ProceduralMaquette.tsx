"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Printable } from "@/core/three/Printable";
import { bakeParts } from "@/core/three/bakeParts";
import { mulberry32, type PrintKit } from "@/core/three/printKit";

type Part = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotationY?: number;
  edgeThreshold?: number;
};

/**
 * A procedural architectural maquette — a city block with a domed landmark
 * at its heart, echoing Demo's compound and mosque projects. It is a stand-in
 * until the real model is dropped into /public/models (see hero.model.ts).
 *
 * ~200 parts are baked into a single geometry: 4 draw calls in total.
 */
export function ProceduralMaquette({
  kit,
  onBounds,
}: {
  kit: PrintKit;
  onBounds: (b: { minY: number; maxY: number; size: number }) => void;
}) {
  const baked = useMemo(() => {
    const parts = buildCity();
    const result = bakeParts(parts);
    new Set(parts.map((p) => p.geometry)).forEach((g) => g.dispose());
    return result;
  }, []);

  useEffect(() => {
    const b = baked.bounds;
    onBounds({ minY: b.min.y, maxY: b.max.y, size: Math.max(b.max.x - b.min.x, b.max.z - b.min.z) });
  }, [baked, onBounds]);

  useEffect(
    () => () => {
      baked.solid.dispose();
      baked.outline.dispose();
    },
    [baked],
  );

  return <Printable kit={kit} geometry={baked.solid} outline={baked.outline} />;
}

/* -------------------------------------------------------------------------- */

function buildCity(): Part[] {
  const rand = mulberry32(7);
  const parts: Part[] = [];
  const box = (w: number, h: number, d: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0); // sit on y = 0
    return g;
  };
  const cyl = (rt: number, rb: number, h: number, seg = 20) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    g.translate(0, h / 2, 0);
    return g;
  };
  const add = (geometry: THREE.BufferGeometry, x: number, y: number, z: number, rotationY = 0, edgeThreshold?: number) =>
    parts.push({ geometry, position: [x, y, z], rotationY, edgeThreshold });

  // Base slab of the maquette
  add(box(6.9, 0.08, 6.9), 0, 0, 0);
  const G = 0.08; // ground level on top of the slab

  // ---- Landmark: domed hall with two minarets (centre cell) -------------
  add(box(1.7, 0.55, 1.7), 0, G, 0);
  add(box(1.2, 0.18, 1.2), 0, G + 0.55, 0);
  add(cyl(0.5, 0.52, 0.16, 32), 0, G + 0.73, 0);
  const dome = new THREE.SphereGeometry(0.5, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  add(dome, 0, G + 0.89, 0, 0, 30);
  add(cyl(0.025, 0.025, 0.22, 8), 0, G + 1.38, 0);
  for (const [mx, mz] of [
    [0.98, 0.98],
    [-0.98, -0.98],
  ]) {
    add(cyl(0.085, 0.1, 2.0, 12), mx, G, mz);
    add(cyl(0.14, 0.14, 0.06, 12), mx, G + 1.35, mz);
    add(cyl(0.14, 0.14, 0.06, 12), mx, G + 1.75, mz);
    const cone = new THREE.ConeGeometry(0.1, 0.32, 12);
    cone.translate(0, 0.16, 0);
    add(cone, mx, G + 2.0, mz);
  }

  // ---- Surrounding cells --------------------------------------------------
  const S = 2.25;
  const cells: [number, number][] = [];
  for (const cx of [-S, 0, S]) for (const cz of [-S, 0, S]) if (cx || cz) cells.push([cx, cz]);

  cells.forEach(([cx, cz], i) => {
    if (cx === -S && cz === -S) {
      // Stepped high-rise with setbacks
      let y = G;
      [
        [1.2, 1.4],
        [0.95, 1.0],
        [0.7, 0.8],
      ].forEach(([w, h]) => {
        add(box(w, h, w), cx, y, cz);
        y += h;
      });
      add(cyl(0.02, 0.02, 0.5, 6), cx, y, cz);
      return;
    }
    if (cx === S && cz === S) {
      // Cylindrical tower with a podium
      add(box(1.5, 0.35, 1.5), cx, G, cz);
      add(cyl(0.48, 0.48, 2.3, 28), cx, G + 0.35, cz, 0, 40);
      add(cyl(0.52, 0.52, 0.08, 28), cx, G + 2.65, cz, 0, 40);
      return;
    }
    // Residential slabs (the compound)
    const horizontal = (i + (cx > 0 ? 1 : 0)) % 2 === 0;
    for (const off of [-0.45, 0.45]) {
      const w = 1.3 + rand() * 0.35;
      const d = 0.48 + rand() * 0.12;
      const h = 0.7 + rand() * 1.0;
      const x = cx + (horizontal ? 0 : off);
      const z = cz + (horizontal ? off : 0);
      const rot = horizontal ? 0 : Math.PI / 2;
      add(box(w, h, d), x, G, z, rot);
      add(box(0.26, 0.16, 0.26), x + (rand() - 0.5) * 0.6 * (horizontal ? 1 : 0), G + h, z, rot);
    }
  });

  // ---- Trees along the avenues -----------------------------------------
  const crown = new THREE.IcosahedronGeometry(0.13, 0);
  crown.translate(0, 0.28, 0);
  const trunk = cyl(0.018, 0.022, 0.2, 5);
  for (const line of [-S / 2, S / 2]) {
    for (let t = -3; t <= 3; t += 0.62) {
      const j = (rand() - 0.5) * 0.1;
      for (const [x, z] of [
        [line + j, t],
        [t, line + j],
      ]) {
        if (Math.abs(x) < 1.05 && Math.abs(z) < 1.05) continue; // keep the plaza clear
        add(trunk, x, G, z);
        add(crown, x, G, z, rand() * Math.PI, 1);
      }
    }
  }

  return parts;
}
