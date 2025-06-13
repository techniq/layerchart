import type { GeometryCollection, Topology } from 'topojson-specification';
import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then((r) =>
      r.json()
    )) as Topology<{
      states: GeometryCollection<{ name: string }>;
      counties: GeometryCollection<{ name: string }>;
    }>,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
