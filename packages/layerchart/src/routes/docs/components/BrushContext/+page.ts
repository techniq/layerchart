import { parse } from '@layerstack/utils';

import api from '$lib/components/BrushContext.svelte?raw&sveld';
import source from '$lib/components/BrushContext.svelte?raw';
import pageSource from './+page.svelte?raw';
import type { AppleStockData } from '$static/data/examples/date/apple-stock.js';

export async function load({ fetch }) {
  return {
    appleStock: await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
      parse<AppleStockData>(await r.text())
    ),
    meta: {
      api,
      source,
      pageSource,
    },
  };
}
