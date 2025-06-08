import { autoType, csvParse } from 'd3-dsv';
import pageSource from './+page.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { USAirportsData } from '$static/data/examples/geo/us-airports.js';
import type { USStateCapitalsData } from '$static/data/examples/geo/us-state-capitals.js';
import type { WorldAirportsData } from '$static/data/examples/geo/world-airports.js';
import type { WorldCapitalsData } from '$static/data/examples/geo/world-capitals.js';

export async function load({ fetch }) {
  return {
    us: {
      geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
        r.json()
      )) as Topology<{
        states: GeometryCollection<{ name: string }>;
      }>,
      airports: (await fetch('/data/examples/geo/us-airports.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      )) as USAirportsData,
      capitals: (await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      )) as USStateCapitalsData,
    },
    world: {
      geojson: (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
        (r) => r.json()
      )) as Topology<{
        countries: GeometryCollection<{ name: string }>;
        land: GeometryCollection;
      }>,
      airports: (await fetch('/data/examples/geo/world-airports.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      )) as WorldAirportsData,
      capitals: (await fetch('/data/examples/geo/world-capitals.json').then(async (r) =>
        r.json()
      )) as WorldCapitalsData,
    },
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
