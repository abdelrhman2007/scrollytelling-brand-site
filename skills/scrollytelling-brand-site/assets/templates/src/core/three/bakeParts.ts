import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export type PartSpec = {
  geometry: THREE.BufferGeometry;
  position?: [number, number, number];
  rotationY?: number;
  /** Crease angle for the outline; low values outline facets (trees). */
  edgeThreshold?: number;
};

/**
 * Bakes many parts into ONE solid geometry + ONE outline geometry.
 * A model of hundreds of parts then costs four draw calls instead of
 * four per part — the single biggest GPU win for the print scenes.
 */
export function bakeParts(parts: PartSpec[]) {
  const solids: THREE.BufferGeometry[] = [];
  const outlines: THREE.BufferGeometry[] = [];
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const unit = new THREE.Vector3(1, 1, 1);
  const up = new THREE.Vector3(0, 1, 0);

  for (const part of parts) {
    position.set(...(part.position ?? [0, 0, 0]));
    rotation.setFromAxisAngle(up, part.rotationY ?? 0);
    matrix.compose(position, rotation, unit);

    // Normalise layouts so mergeGeometries accepts every primitive type.
    const solid = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
    for (const name of Object.keys(solid.attributes)) {
      if (name !== "position" && name !== "normal") solid.deleteAttribute(name);
    }
    if (!solid.attributes.normal) solid.computeVertexNormals();
    solids.push(solid.applyMatrix4(matrix));
    outlines.push(new THREE.EdgesGeometry(part.geometry, part.edgeThreshold ?? 20).applyMatrix4(matrix));
  }

  const solid = mergeGeometries(solids, false);
  const outline = mergeGeometries(outlines, false);
  solids.forEach((g) => g.dispose());
  outlines.forEach((g) => g.dispose());
  if (!solid || !outline) throw new Error("bakeParts: incompatible geometries");

  solid.computeBoundingBox();
  solid.computeBoundingSphere();
  return { solid, outline, bounds: solid.boundingBox! };
}
