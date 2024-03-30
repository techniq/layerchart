import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      related: ['https://observablehq.com/@d3/force-directed-tree'],
    },
  };
}
