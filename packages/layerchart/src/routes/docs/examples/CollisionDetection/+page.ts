import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: [
        'https://d3js.org/d3-force/collide',
        'https://observablehq.com/@d3/collision-detection',
      ],
    },
  };
}
