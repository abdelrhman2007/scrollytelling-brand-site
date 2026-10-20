"use client";

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { brand } from "@/core/config/brand";
import { createPrintKit, smoothstep } from "@/core/three/printKit";
import type { PrintState } from "../../controller/useHeroController";
import { ProceduralMaquette } from "./ProceduralMaquette";

// The GLTF loader is only downloaded when a real model is configured.
const GLBMaquette = lazy(() => import("./GLBMaquette"));

type Bounds = { minY: number; maxY: number; size: number };


export default function HeroCanvas({
  state,
  active,
  modelSrc,
}: {
  state: RefObject<PrintState>;
  active: boolean;
  modelSrc: string | null;
}) {
  return (
    <Canvas
      // Same quality on every device; rendering on demand keeps it affordable and
      // adaptive DPR (below) steps down only on GPUs that actually struggle.
      shadows="percentage"
      dpr={[1, 1.5]}
      // Render on demand: frames are requested by scroll, pointer and easing only,
      // so an idle hero costs nothing.
      frameloop={active ? "demand" : "never"}
      camera={{ position: [8, 6, 9], fov: 32, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default", stencil: false }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Stage state={state} modelSrc={modelSrc} />
    </Canvas>
  );
}

function Stage({ state, modelSrc }: { state: RefObject<PrintState>; modelSrc: string | null }) {
  const kit = useMemo(() => createPrintKit(), []);
  useEffect(() => () => kit.dispose(), [kit]);

  const bounds = useRef<Bounds>({ minY: 0, maxY: 3.2, size: 6.9 });
  const onBounds = useCallback((b: Bounds) => {
    bounds.current = b;
  }, []);

  const head = useRef<THREE.Group>(null);
  const bridge = useRef<THREE.Group>(null);
  const layerRing = useRef<THREE.LineLoop>(null);
  const glow = useRef<THREE.PointLight>(null);
  // Start from the current scroll position, so a remount (scrolling back up)
  // shows the model as it should be instead of replaying the print.
  const smooth = useRef({ p: state.current?.target ?? 0, t: 0, activity: 0, slowFrames: 0, first: true });
  const pointer = useRef({ x: 0, y: 0 });
  const desired = useMemo(() => new THREE.Vector3(), []);
  const { camera, size, invalidate, setDpr } = useThree();

  // Scroll (controller) and pointer movement request frames.
  useEffect(() => {
    const s = state.current;
    if (s) s.invalidate = invalidate;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (s) s.invalidate = undefined;
      window.removeEventListener("pointermove", onMove);
    };
  }, [state, invalidate]);

  // Push the model to the right on wide screens to leave room for copy.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    if (aspect > 1.15) {
      // Landscape: model to the right of the copy.
      cam.setViewOffset(size.width, size.height, -size.width * 0.17, size.height * 0.02, size.width, size.height);
    } else if (aspect < 0.95) {
      // Portrait (phones, tablets): model lower, headline keeps clear space above.
      cam.setViewOffset(size.width, size.height, 0, -size.height * 0.14, size.width, size.height);
    } else {
      cam.clearViewOffset();
    }
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  const ringGeo = useMemo(() => {
    const s = 3.55;
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-s, 0, -s),
      new THREE.Vector3(s, 0, -s),
      new THREE.Vector3(s, 0, s),
      new THREE.Vector3(-s, 0, s),
    ]);
  }, []);

  useFrame((three, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20); // first frame after idle has a huge dt
    const st = smooth.current;
    const target = state.current?.target ?? 0;
    const prev = st.p;
    st.p += (target - st.p) * Math.min(1, dt * 3.5);
    if (Math.abs(target - st.p) < 5e-4) st.p = target;
    st.activity += (Math.min(1, Math.abs(st.p - prev) * 120) - st.activity) * Math.min(1, dt * 6);
    if (st.activity < 5e-3) st.activity = 0;

    const p = st.p;
    const { minY, maxY } = bounds.current;
    const h = THREE.MathUtils.lerp(minY - 0.002, maxY + 0.02, p);
    kit.setHeight(h);

    // Print head: a raster-ish Lissajous sweep that only moves while printing.
    st.t += dt * st.activity * 6;
    const hx = Math.sin(st.t * 2.3 + 0.6) * 2.6;
    const hz = Math.sin(st.t * 0.9 + 1.2) * 2.6;
    const lift = smoothstep(0.9, 1, p) * 2.4;
    const hy = h + 0.16 + lift;

    if (head.current) head.current.position.set(hx, hy, hz);
    if (bridge.current) bridge.current.position.set(0, hy + 0.55, hz);
    if (glow.current) {
      glow.current.position.set(hx, h + 0.05, hz);
      glow.current.intensity = (0.6 + st.activity * 3) * (1 - smoothstep(0.92, 1, p));
    }
    if (layerRing.current) {
      layerRing.current.position.y = h;
      (layerRing.current.material as THREE.LineBasicMaterial).opacity = 0.75 * (1 - smoothstep(0.95, 1, p)) * smoothstep(0, 0.02, p);
    }

    // Camera rig: scroll dolly + pointer parallax.
    const cam = three.camera as THREE.PerspectiveCamera;
    const aspect = three.size.width / three.size.height;
    const mobile = aspect < 0.6 ? 2.15 : aspect < 0.9 ? 1.7 : aspect < 1.15 ? 1.25 : 1;
    const theta = -0.8 + p * 1.05 + pointer.current.x * 0.08;
    const radius = (12.6 - p * 1.1) * mobile;
    desired.set(Math.sin(theta) * radius, 6.8 - p * 0.9 + pointer.current.y * 0.35, Math.cos(theta) * radius);
    if (st.first) {
      cam.position.copy(desired); // no fly-in after a remount
      st.first = false;
    }
    cam.position.lerp(desired, Math.min(1, dt * 2.5));
    const camSettled = cam.position.distanceToSquared(desired) < 4e-4; // ~2 cm in a 12 m scene
    if (camSettled) cam.position.copy(desired);
    cam.lookAt(0, 1.0 + p * 0.25, 0);

    // Adaptive quality: sustained slow frames → drop to 1x pixel density.
    st.slowFrames = rawDt > 1 / 40 && rawDt < 0.5 ? st.slowFrames + 1 : Math.max(0, st.slowFrames - 1);
    if (st.slowFrames > 20 && three.viewport.dpr > 1) {
      setDpr(1);
      st.slowFrames = 0;
    }

    // Keep requesting frames only until everything has settled.
    const settled = st.p === target && st.activity === 0 && camSettled;
    if (!settled) three.invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#bcd2ff" />
      <hemisphereLight args={["#dfe9ff", brand.colors.navy900, 0.6]} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-6, 3, -5]} intensity={0.9} color={brand.colors.yellow} />
      <pointLight ref={glow} color={brand.colors.yellow} distance={2.6} decay={2} />

      <PrintBed />

      <Suspense fallback={null}>
        {modelSrc ? (
          <GLBMaquette src={modelSrc} kit={kit} onBounds={onBounds} />
        ) : (
          <ProceduralMaquette kit={kit} onBounds={onBounds} />
        )}
      </Suspense>

      {/* Current layer outline */}
      <lineLoop ref={layerRing} geometry={ringGeo}>
        <lineBasicMaterial color={brand.colors.yellow} transparent opacity={0} />
      </lineLoop>

      <Gantry bridge={bridge} head={head} />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function PrintBed() {
  return (
    <group position={[0, -0.001, 0]}>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[8.2, 0.24, 8.2]} />
        <meshStandardMaterial color={brand.colors.navy950} roughness={0.45} metalness={0.5} />
      </mesh>
      <gridHelper args={[8.2, 41, brand.colors.blueprint, brand.colors.navy700]} position={[0, 0.002, 0]} />
    </group>
  );
}

const metal = new THREE.MeshStandardMaterial({ color: "#2b3a52", roughness: 0.35, metalness: 0.85 });
const nozzleBrass = new THREE.MeshStandardMaterial({ color: "#d8b45a", roughness: 0.3, metalness: 0.9 });
const housing = new THREE.MeshStandardMaterial({ color: brand.colors.yellow, roughness: 0.5, metalness: 0.1 });

function Gantry({
  bridge,
  head,
}: {
  bridge: RefObject<THREE.Group | null>;
  head: RefObject<THREE.Group | null>;
}) {
  return (
    <group>
      {/* Moving bridge: rides Z, carries the X rail */}
      <group ref={bridge}>
        <mesh material={metal} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 7.4, 12]} />
        </mesh>
        <mesh material={metal} position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 7.4, 12]} />
        </mesh>
        {[-3.7, 3.7].map((x) => (
          <mesh key={x} position={[x, 0.08, 0]} material={metal}>
            <boxGeometry args={[0.3, 0.4, 0.3]} />
          </mesh>
        ))}
      </group>
      {/* Print head */}
      <group ref={head}>
        <mesh position={[0, 0.62, 0]} material={housing} castShadow>
          <boxGeometry args={[0.42, 0.48, 0.36]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={metal}>
          <boxGeometry args={[0.24, 0.18, 0.24]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={nozzleBrass} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.07, 0.22, 16]} />
        </mesh>
        <mesh position={[0, -0.01, 0]}>
          <sphereGeometry args={[0.022, 12, 8]} />
          <meshBasicMaterial color={brand.colors.yellow} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
