import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      related: [
        'https://d3js.org/d3-force/link',
        'https://observablehq.com/@d3/force-directed-lattice',
      ],
    },
  };
}
