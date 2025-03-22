import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    miserables: await fetch('/data/examples/graph/disjoint-graph.json').then((r) => r.json()),
    meta: {
      pageSource,
      related: ['https://observablehq.com/@d3/disjoint-force-directed-graph'],
    },
  };
}
