import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['https://observablehq.com/@d3/force-directed-tree'],
    },
  };
}
