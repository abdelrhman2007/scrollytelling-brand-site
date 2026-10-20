export const aboutModel = {
  index: "01",
  label: "Who is Demo",
  statement:
    "Demo is the house of [[prototyping]]. Designers and engineers turning ideas into products you can see, test and [[hold]] — from the first sketch to the first batch.",
  body: [
    "We take an idea the whole way: design and engineering, architectural maquettes, functional prototypes, 3D printing and small-batch manufacturing — with PCB design for electronics coming soon.",
    "One team and one process, so what you approve on screen is what you hold in your hand — whether it is a model for a sales centre or a product ready for its first customers.",
  ],
  image: {
    src: "/images/brand/who-is-demo.webp",
    alt: "A white lattice structure being 3D printed under a nozzle",
    caption: "Fig. 01 — Print in progress",
  },
  facts: [
    { value: "06", label: "Capabilities", detail: "From design to small-batch production" },
    { value: "03", label: "Material families", detail: "Plastics · Resins · Metals" },
    { value: "∞", label: "Iterations", detail: "Until it’s exactly right" },
  ],
};

export type AboutModel = typeof aboutModel;
