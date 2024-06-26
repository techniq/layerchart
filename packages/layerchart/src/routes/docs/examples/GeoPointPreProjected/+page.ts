import { autoType, csvParse } from 'd3-dsv';
import pageSource from './+page.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { USStateCapitalsData } from '$static/data/examples/geo/us-state-capitals.js';

export async function load({ fetch }) {
  // TODO: Support different US (https://github.com/topojson/us-atlas) and World (https://github.com/topojson/world-atlas) files
  // TODO: Cache: https://github.com/sveltejs/kit/issues/3642
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json').then(
      (r) => r.json()
    )) as Topology<{
      states: GeometryCollection<{ name: string }>;
    }>,
    stateCaptitals: (await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    )) as USStateCapitalsData,
    meta: {
      pageSource,
    },
  };
}
