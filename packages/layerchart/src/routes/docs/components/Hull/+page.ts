import { autoType, csvParse } from 'd3-dsv';

import pageSource from './+page.svelte?raw';
import api from '$lib/components/Hull.svelte?raw&sveld';
import source from '$lib/components/Hull.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';

export async function load() {
  return {
    groupData: await fetch('/data/examples/group-data.json').then((r) => r.json()),
    us: {
      geojson: (await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
        r.json()
      )) as Topology<{
        states: GeometryCollection<{ name: string }>;
      }>,
      stateCaptitals: await fetch('/data/examples/geo/us-state-capitals.csv').then(async (r) =>
        csvParse(await r.text(), autoType)
      ),
    },
    meta: {
      api,
      source,
      pageSource,
    },
  };
}
