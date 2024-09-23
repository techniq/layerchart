import { autoType, csvParse } from 'd3-dsv';

import api from '$lib/components/charts/ScatterChart.svelte?raw&sveld';
import source from '$lib/components/charts/ScatterChart.svelte?raw';
import pageSource from './+page.svelte?raw';

import type { PenguinsData } from '$static/data/examples/penguins.js';

export async function load() {
  return {
    penguins: (await fetch('/data/examples/penguins.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    )) as PenguinsData,
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Scatter charts',
      related: ['components/Chart', 'components/Points', 'examples/Scatter'],
    },
  };
}
