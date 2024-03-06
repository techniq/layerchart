import { autoType, csvParse } from 'd3-dsv';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    us: {
      geojson: await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
        r.json()
      ),
      stateCaptitals: await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      ),
    },
    world: {
      geojson: await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
        (r) => r.json()
      ),

      airports: await fetch('/data/examples/geo/world-airports.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      ),
    },
    meta: {
      pageSource,
    },
  };
}
