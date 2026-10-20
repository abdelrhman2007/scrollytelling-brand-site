/**
 * DEMO — brand identity tokens.
 * Mirrors the CSS custom properties in app/globals.css so that
 * JS-driven visuals (WebGL, canvas) stay on-brand.
 */
export const brand = {
  name: "Demo",
  tagline: "The House of Prototyping",
  colors: {
    navy950: "#000f22",
    navy900: "#00172f",
    navy800: "#00264d",
    navy700: "#0a3a6e",
    blueprint: "#3d7bd9",
    yellow: "#f9d800",
    yellowDeep: "#d9b800",
    paper: "#f3efe6",
    white: "#ffffff",
  },
  logo: {
    full: "/images/brand/logo-full.png",
    mark: "/images/brand/logo-mark.png",
    tagline: "/images/brand/logo-tagline.png",
    ratio: { full: 924 / 442, mark: 882 / 331 },
  },
} as const;

export type Brand = typeof brand;
