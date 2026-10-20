"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Printable } from "@/core/three/Printable";
import { bakeParts } from "@/core/three/bakeParts";
import type { PrintKit } from "@/core/three/printKit";

/**
 * Loads any GLB/GLTF, bakes it onto the print bed as one geometry and renders
 * it through the print kit — so a client's own CAD export prints exactly like
 * the procedural stand-in. This file (and the GLTF loader) is code-split and
 * only downloaded when hero.model.ts points at a model.
 */
export default function GLBMaquette({
  src,
  kit,
  fit = 6,
  onBounds,
}: {
  src: string;
  kit: PrintKit;
  fit?: number;
  onBounds: (b: { minY: number; maxY: number; size: number }) => void;
}) {
  const { scene } = useLoader(GLTFLoader, src);

  const baked = useMemo(() => {
    scene.updateMatrixWorld(true);
    const parts: { geometry: THREE.BufferGeometry }[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) parts.push({ geometry: mesh.geometry.clone().applyMatrix4(mesh.matrixWorld) });
    });
    const merged = bakeParts(parts.map((p) => ({ ...p, edgeThreshold: 25 })));
    parts.forEach((p) => p.geometry.dispose());

    // Normalise: centre on X/Z, sit on y = 0, scale to fit the bed.
    const size = merged.bounds.getSize(new THREE.Vector3());
    const center = merged.bounds.getCenter(new THREE.Vector3());
    const scale = fit / Math.max(size.x, size.z, size.y * 1.4);
    const m = new THREE.Matrix4()
      .makeScale(scale, scale, scale)
      .multiply(new THREE.Matrix4().makeTranslation(-center.x, -merged.bounds.min.y, -center.z));
    merged.solid.applyMatrix4(m);
    merged.outline.applyMatrix4(m);
    return { ...merged, maxY: size.y * scale, footprint: Math.max(size.x, size.z) * scale };
  }, [scene, fit]);

  useEffect(() => {
    onBounds({ minY: 0, maxY: baked.maxY, size: baked.footprint });
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
