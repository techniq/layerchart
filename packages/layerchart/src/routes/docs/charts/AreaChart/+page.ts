import { parse } from 'svelte-ux';

import api from '$lib/components/charts/AreaChart.svelte?raw&sveld';
import source from '$lib/components/charts/AreaChart.svelte?raw';
import pageSource from './+page.svelte?raw';

import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';

export async function load() {
  return {
    appleStock: await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
      parse<AppleStockData>(await r.text())
    ),
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Area', 'examples/Area'],
    },
  };
}
