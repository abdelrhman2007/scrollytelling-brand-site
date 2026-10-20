export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export const pad = (n: number, size = 3) => String(Math.round(n)).padStart(size, "0");

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
