import { autoType, csvParse } from 'd3-dsv';

import api from '$lib/components/charts/BarChart.svelte?raw&sveld';
import source from '$lib/components/charts/BarChart.svelte?raw';
import pageSource from './+page.svelte?raw';

import type { WorldPopulationDemographicsData } from '$static/data/examples/world-population-demographics.js';
import { ascending, flatGroup, max, mean, min } from 'd3-array';

export async function load({ fetch }) {
  return {
    worldPopulationDemographics: (await fetch(
      '/data/examples/world-population-demographics.csv'
    ).then(async (r) => csvParse(await r.text(), autoType))) as WorldPopulationDemographicsData,
    sfoTemperatures: await fetch('/data/examples/sfoTemperatures.csv').then(async (r) => {
      return flatGroup(
        csvParse<{ date: Date; tavg: number; tmax: number; tmin: number }>(
          await r.text(),
          // @ts-expect-error
          autoType
        ),
        (d) => new Date(Date.UTC(2000, d.date.getUTCMonth(), d.date.getUTCDate())) // group by day of year
      )
        .sort(([a], [b]) => ascending(a, b)) // sort chronologically
        .map(([date, v]) => ({
          date,
          avg: mean(v, (d) => d.tavg || NaN),
          min: mean(v, (d) => d.tmin || NaN),
          max: mean(v, (d) => d.tmax || NaN),
          minmin: min(v, (d) => d.tmin || NaN),
          maxmax: max(v, (d) => d.tmax || NaN),
        }));
    }),
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
