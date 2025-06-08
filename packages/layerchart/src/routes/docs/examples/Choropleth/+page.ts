import type { GeometryCollection, Topology } from 'topojson-specification';
import pageSource from './+page.svelte?raw';
import type { USCountyPopulationData } from '$static/data/examples/geo/us-county-population-2020.js';

export async function load({ fetch }) {
  // TODO: Support different US (https://github.com/topojson/us-atlas) and World (https://github.com/topojson/world-atlas) files
  // TODO: Cache: https://github.com/sveltejs/kit/issues/3642
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json').then(
      (r) => r.json()
    )) as Topology<{
      states: GeometryCollection<{ name: string }>;
      counties: GeometryCollection<{ name: string }>;
    }>,
    population: (await fetch('/data/examples/geo/us-county-population-2020.json').then((r) =>
      r.json()
    )) as USCountyPopulationData,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
