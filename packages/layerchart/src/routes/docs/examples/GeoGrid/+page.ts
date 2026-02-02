import pageSource from './+page.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';

export async function load({ fetch }) {
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    )) as Topology<{
      countries: GeometryCollection<{ name: string }>;
      land: GeometryCollection;
    }>,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
