"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { brand } from "@/core/config/brand";
import { createPrintKit, smoothstep } from "@/core/three/printKit";
import { Printable } from "@/core/three/Printable";
import type { ModelKind } from "../../model/capabilities.model";
import { buildModel } from "./serviceModels";

/** Shared, mutable state written by the controller (scroll) and read per frame. */
export type ServicesState = { progress: number; invalidate?: () => void };

export default function ServicesCanvas({
  state,
  kinds,
  active,
}: {
  state: RefObject<ServicesState>;
  kinds: ModelKind[];
  active: boolean;
}) {
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      frameloop={active ? "demand" : "never"}
      camera={{ position: [0, 3.6, 8.4], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default", stencil: false }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <Stage state={state} kinds={kinds} />
    </Canvas>
  );
}

function Stage({ state, kinds }: { state: RefObject<ServicesState>; kinds: ModelKind[] }) {
  const kit = useMemo(() => createPrintKit(), []);
  const key = kinds.join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const models = useMemo(() => kinds.map(buildModel), [key]);
  useEffect(() => () => kit.dispose(), [kit]);
  useEffect(
    () => () =>
      models.forEach((m) => {
        m.solid.dispose();
        m.outline.dispose();
      }),
    [models],
  );

  const turntable = useRef<THREE.Group>(null);
  const items = useRef<(THREE.Group | null)[]>([]);
  const head = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const smooth = useRef({ p: state.current?.progress ?? 0, idx: -1, slowFrames: 0 });
  const { camera, size, invalidate, setDpr } = useThree();

  useEffect(() => {
    const s = state.current;
    if (s) s.invalidate = invalidate;
    return () => {
      if (s) s.invalidate = undefined;
    };
  }, [state, invalidate]);

  // Landscape: model to the right of the copy. Portrait: model in the upper part.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    if (aspect > 1.15) cam.setViewOffset(size.width, size.height, -size.width * 0.2, 0, size.width, size.height);
    else if (aspect < 0.95) cam.setViewOffset(size.width, size.height, 0, size.height * 0.2, size.width, size.height);
    else cam.clearViewOffset();
    // Narrow screens have a narrow horizontal field of view: back off so the
    // model always fits across (≈ 4.4 units visible width).
    cam.position.z = aspect < 0.95 ? Math.min(19, 8.2 / aspect) : 9.2;
    cam.position.y = aspect < 0.95 ? 4.4 : 3.6;
    cam.lookAt(0, 1.1, 0);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  useFrame((three, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const st = smooth.current;
    const target = state.current?.progress ?? 0;
    st.p += (target - st.p) * Math.min(1, dt * 5);
    if (Math.abs(target - st.p) < 5e-4) st.p = target;

    // Which service, and how far through its segment.
    const n = models.length;
    const x = Math.min(st.p, 0.99999) * n;
    const idx = Math.floor(x);
    const t = x - idx;
    if (idx !== st.idx) {
      items.current.forEach((g, i) => g && (g.visible = i === idx));
      st.idx = idx;
    }

    // appear → build → hold → exit
    const build = smoothstep(0.12, 0.78, t);
    const enter = smoothstep(0, 0.1, t);
    const exit = smoothstep(0.92, 1, t) * (idx < n - 1 ? 1 : 0);
    const model = models[idx];
    const h = THREE.MathUtils.lerp(-0.002, model.height + 0.02, build);
    kit.setHeight(h);

    if (turntable.current) {
      const sc = 0.82 + 0.18 * enter - 0.18 * exit;
      turntable.current.scale.setScalar(sc);
      turntable.current.position.y = -0.4 * exit;
      turntable.current.rotation.y = -0.7 + t * 1.3 + idx * 0.4;
    }

    // Nozzle circles the current layer while building, then lifts away.
    const done = smoothstep(0.78, 0.9, t);
    const a = t * 70;
    if (head.current) {
      head.current.visible = done < 1;
      head.current.position.set(Math.cos(a) * 1.2, h * (0.82 + 0.18 * enter) + 0.14 + done * 1.6, Math.sin(a) * 1.2);
    }
    if (glow.current) {
      glow.current.position.set(0, h, 0);
      glow.current.intensity = 2.4 * (1 - done) * enter;
    }

    // Adaptive quality: sustained slow frames → 1x pixel density.
    st.slowFrames = rawDt > 1 / 40 && rawDt < 0.5 ? st.slowFrames + 1 : Math.max(0, st.slowFrames - 1);
    if (st.slowFrames > 20 && three.viewport.dpr > 1) {
      setDpr(1);
      st.slowFrames = 0;
    }

    if (st.p !== target) three.invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#c8d8ff" />
      <hemisphereLight args={["#dfe9ff", brand.colors.navy900, 0.5]} />
      <directionalLight
        position={[4, 8, 5]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0006}
      />
      <directionalLight position={[-5, 2, -4]} intensity={1} color={brand.colors.yellow} />
      <pointLight ref={glow} color={brand.colors.yellow} distance={2.6} />

      <group ref={turntable}>
        {models.map((m, i) => (
          <group key={i} ref={(g) => void (items.current[i] = g)} visible={i === 0}>
            <Printable kit={kit} geometry={m.solid} outline={m.outline} />
          </group>
        ))}
      </group>

      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.3, 2.3, 0.1, 64]} />
        <meshStandardMaterial color={brand.colors.navy950} metalness={0.5} roughness={0.45} />
      </mesh>

      <group ref={head}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.26]} />
          <meshStandardMaterial color={brand.colors.yellow} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.16, 12]} />
          <meshStandardMaterial color="#d8b45a" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </>
  );
}
