import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    miserables: await fetch('/data/examples/graph/miserables.json').then((r) => r.json()),
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['https://observablehq.com/@d3/force-directed-graph'],
    },
  };
}
