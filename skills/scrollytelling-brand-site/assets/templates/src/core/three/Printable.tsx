"use client";

import type { BufferGeometry } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { edgesOf, type PrintKit } from "./printKit";

type Props = ThreeElements["group"] & {
  geometry: BufferGeometry;
  kit: PrintKit;
  /** Pre-baked outline (see bakeParts). Computed from `geometry` when omitted. */
  outline?: BufferGeometry;
  /** Skip outlines for organic shapes to keep the blueprint clean. */
  edges?: boolean;
  edgeThreshold?: number;
};

/** One printable part: solid + molten cap + solid outline + blueprint ghost. */
export function Printable({ geometry, kit, outline, edges = true, edgeThreshold, ...group }: Props) {
  const m = kit.materials;
  const lines = edges ? (outline ?? edgesOf(geometry, edgeThreshold)) : null;
  return (
    <group {...group}>
      <mesh geometry={geometry} material={m.solid} castShadow receiveShadow />
      <mesh geometry={geometry} material={m.cap} />
      {lines && (
        <>
          <lineSegments geometry={lines} material={m.solidEdges} />
          <lineSegments geometry={lines} material={m.ghostEdges} />
        </>
      )}
    </group>
  );
}
