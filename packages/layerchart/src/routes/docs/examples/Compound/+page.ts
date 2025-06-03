import { autoType, csvParse } from 'd3-dsv';
import { parse } from '@layerstack/utils';

import type { AppleTickerData } from '$static/data/examples/date/apple-ticker.js';
import type { NewPassengerCars } from '$static/data/examples/new-passenger-cars.js';

import { data as hydropgraphData } from './hydropgraph.js';

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
    hydropgraph: hydropgraphData,
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
