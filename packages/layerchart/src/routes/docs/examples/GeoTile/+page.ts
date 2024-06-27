import type { GeometryCollection, Topology } from 'topojson-specification';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
      r.json()
    )) as Topology<{
      states: GeometryCollection<{ name: string }>;
    }>,
    meta: {
      pageSource,
      related: ['examples/ZoomableTileMap'],
    },
  };
}
