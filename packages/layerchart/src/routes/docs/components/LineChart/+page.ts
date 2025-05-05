import { csvParse, autoType } from 'd3-dsv';
import { parse } from '@layerstack/utils';

import api from '$lib/components/charts/LineChart.svelte?raw&sveld';
import source from '$lib/components/charts/LineChart.svelte?raw';
import { celsiusToFahrenheit } from '$lib/utils/math.js';
import pageSource from './+page.svelte?raw';

import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';

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
        .filter((d) => d.value !== 'NA' && d.dayOfYear <= 365 /* Ignore 366th day */)
        .map((d) => {
          const origDate = new Date(d.year, 0, d.dayOfYear);
          return {
            ...d,
            date: new Date(Date.UTC(2000, origDate.getUTCMonth(), origDate.getUTCDate())),
            value: d.value !== 'NA' ? celsiusToFahrenheit(d.value) : 'NA',
          };
        });
    }),
    dailyTemperature: await fetch('/data/examples/date/daily-temperature.json').then(async (r) =>
      parse<{ date: Date; value: number }[]>(await r.text())
    ),
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Line charts',
      related: ['components/Chart', 'components/Spline', 'examples/Line'],
    },
  };
}
