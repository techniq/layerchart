import { autoType, csvParse } from 'd3-dsv';

import pageSource from './+page.svelte?raw';
import api from '$lib/components/Hull.svelte?raw&sveld';
import source from '$lib/components/Hull.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';
import type { USStateCapitalsData } from '$static/data/examples/geo/us-state-capitals.js';

export async function load({ fetch }) {
  return {
    groupData: (await fetch('/data/examples/group-data.json').then((r) => r.json())) as {
      x: number;
      y: number;
      group: string;
    }[],
    us: {
      geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
        r.json()
      )) as Topology<{
        states: GeometryCollection<{ name: string }>;
      }>,
      stateCaptitals: (await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      )) as USStateCapitalsData,
    },
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
