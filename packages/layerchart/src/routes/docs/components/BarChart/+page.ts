import { autoType, csvParse } from 'd3-dsv';

import api from '$lib/components/charts/BarChart.svelte?raw&sveld';
import source from '$lib/components/charts/BarChart.svelte?raw';
import pageSource from './+page.svelte?raw';

import type { WorldPopulationDemographicsData } from '$static/data/examples/world-population-demographics.js';

export async function load() {
  return {
    worldPopulationDemographics: (await fetch(
      '/data/examples/world-population-demographics.csv'
    ).then(async (r) => csvParse(await r.text(), autoType))) as WorldPopulationDemographicsData,
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Bar charts',
      related: [
        'components/Chart',
        'components/Bars',
        'examples/Bars',
        'examples/Histogram',
        'examples/Sparkbar',
      ],
    },
  };
}
