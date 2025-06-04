import { autoType, csvParse } from 'd3-dsv';
import { parse } from '@layerstack/utils';

import type { AppleTickerData } from '$static/data/examples/date/apple-ticker.js';
import type { NewPassengerCars } from '$static/data/examples/new-passenger-cars.js';
import type { HydroData } from '$static/data/examples/date/hydro.js';

import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    appleTicker: (await fetch('/data/examples/date/apple-ticker.json').then(async (r) =>
      parse(await r.text())
    )) as AppleTickerData,
    newPassengerCars: await fetch('/data/examples/new-passenger-cars.csv').then(async (r) =>
      // @ts-expect-error
      csvParse<NewPassengerCars>(await r.text(), autoType)
    ),
    hydro: (await fetch('/data/examples/date/hydro.json').then(async (r) =>
      parse(await r.text())
    )) as HydroData,
    meta: {
      pageSource,
      related: [
        'components/Bars',
        'examples/Bars',
        'examples/Histogram',
        'examples/Sparkbar',
        'examples/DualAxis',
      ],
    },
  };
}
