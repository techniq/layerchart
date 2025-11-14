import type { GeometryCollection, Topology } from 'topojson-specification';
import pageSource from './+page.svelte?raw';
import type { WorldLinksData } from '$static/data/examples/geo/world-links.js';

export async function load({ fetch }) {
  // TODO: Support different US (https://github.com/topojson/us-atlas) and World (https://github.com/topojson/world-atlas) files
  // TODO: Cache: https://github.com/sveltejs/kit/issues/3642
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    )) as Topology<{
      countries: GeometryCollection<{ name: string }>;
      land: GeometryCollection;
    }>,
    worldLinks: (await fetch('/data/examples/geo/world-links.json').then((r) =>
      r.json()
    )) as WorldLinksData,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      reference: 'https://observablehq.com/@armollica/globe-with-lofted-arcs',
    },
  };
}
