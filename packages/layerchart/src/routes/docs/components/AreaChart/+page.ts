import { csvParse, autoType } from 'd3-dsv';
import { parse } from '@layerstack/utils';

import api from '$lib/components/charts/AreaChart.svelte?raw&sveld';
import source from '$lib/components/charts/AreaChart.svelte?raw';
import pageSource from './+page.svelte?raw';

import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';
import { ascending, flatGroup, max, mean, min } from 'd3-array';
import { celsiusToFahrenheit } from '$lib/utils/math.js';

export async function load({ fetch }) {
  return {
    appleStock: await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
      parse<AppleStockData>(await r.text())
    ),
    dailyTemperatures: await fetch('/data/examples/dailyTemperatures.csv').then(async (r) => {
      return csvParse<{ dayOfYear: number; year: number; value: number | 'NA' }>(
        await r.text(),
        // @ts-expect-error
        autoType
      )
        .filter((d) => d.value !== 'NA')
        .map((d) => {
          const origDate = new Date(d.year, 0, d.dayOfYear);
          return {
            ...d,
            date: new Date(Date.UTC(2000, origDate.getUTCMonth(), origDate.getUTCDate())),
            value: d.value !== 'NA' ? celsiusToFahrenheit(d.value) : 'NA',
          };
        });
    }),
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
      description: 'Streamlined Chart configuration for Area charts',
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Chart', 'components/Area', 'examples/Area'],
    },
  };
}
