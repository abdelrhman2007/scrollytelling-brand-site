export type HeroPhase = {
  id: string;
  /** Lines of the headline. Wrap words in [[ ]] for the yellow highlight. */
  lines: string[];
  kicker?: string;
};

export type HeroModel = {
  /**
   * Drop any .glb/.gltf into /public/models and point `src` at it to replace
   * the procedural maquette, e.g. "/models/hero.glb". Leave null to use the
   * built-in procedural city block.
   */
  model: { src: string | null; scale?: number };
  /** Pinned scroll length of the hero, as a percentage of viewport height. */
  scrollLength: number;
  totalLayers: number;
  jobName: string;
  phases: HeroPhase[];
  services: string[];
  cue: string;
};

export const heroModel: HeroModel = {
  model: { src: null },
  scrollLength: 280,
  totalLayers: 240,
  jobName: "your_idea_v01.stl",
  phases: [
    {
      id: "seen",
      kicker: "The House of Prototyping",
      lines: ["Every idea", "deserves to be", "[[seen.]]"],
    },
    {
      id: "layer",
      kicker: "Design → Prototype → Product",
      lines: ["From a sketch", "to a product", "you can [[hold.]]"],
    },
  ],
  services: ["Design", "Prototype", "Manufacture"],
  cue: "Scroll to build",
};
