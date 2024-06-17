import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    miserables: await fetch('/data/examples/graph/miserables.json').then((r) => r.json()),
    meta: {
      pageSource,
      related: ['https://observablehq.com/@d3/force-directed-graph'],
    },
  };
}
