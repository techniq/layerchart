import { autoType, csvParse } from 'd3-dsv';

import pageSource from './+page.svelte?raw';
import type { NewPassengerCars } from '$static/data/examples/new-passenger-cars.js';

export async function load() {
  return {
    newPassengerCars: await fetch('/data/examples/new-passenger-cars.csv').then(async (r) =>
      csvParse<NewPassengerCars>(await r.text(), autoType)
    ),
    meta: {
      pageSource,
    },
  };
}
