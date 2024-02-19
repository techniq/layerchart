import { csvParse, autoType } from 'd3-dsv';
import { ascending, flatGroup, max, mean, min } from 'd3-array';

import pageSource from './+page.svelte?raw';
import { celsiusToFahrenheit } from '$lib/utils/math';

export async function load() {
  return {
    dailyTemperatures: await fetch('/data/examples/dailyTemperatures.csv').then(async (r) => {
      return csvParse(await r.text(), autoType)
        .filter((d) => d.value !== 'NA')
        .map((d) => {
          const origDate = new Date(d.year, 0, d.dayOfYear);
          return {
            ...d,
            date: new Date(Date.UTC(2000, origDate.getUTCMonth(), origDate.getUTCDate())),
            value: celsiusToFahrenheit(d.value),
          };
        });
    }),
    sfoTemperatures: await fetch('/data/examples/sfoTemperatures.csv').then(async (r) => {
      return flatGroup(
        csvParse(await r.text(), autoType),
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
      pageSource,
    },
  };
}
