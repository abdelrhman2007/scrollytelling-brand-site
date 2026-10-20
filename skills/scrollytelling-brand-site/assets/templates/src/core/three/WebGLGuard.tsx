"use client";

import { Component, type ReactNode } from "react";

let supported: boolean | null = null;

/** Cached WebGL capability check (old devices, blocked GPUs, some in-app browsers). */
export function hasWebGL() {
  if (supported !== null) return supported;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    supported = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    supported = false;
  }
  return supported;
}

/**
 * Renders 3D only where it can work. Without WebGL — or if the GPU context
 * crashes — the section keeps its blueprint background and copy, so the page
 * never breaks on any device.
 */
export class WebGLGuard extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("3D scene disabled:", error);
  }

  render() {
    if (this.state.failed || !hasWebGL()) return this.props.fallback ?? null;
    return this.props.children;
  }
}
