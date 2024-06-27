import { parse } from 'svelte-ux';
import type { AppleTickerData } from '$static/data/examples/date/apple-ticker.js';

import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    appleTicker: (await fetch('/data/examples/date/apple-ticker.json').then(async (r) =>
      parse(await r.text())
    )) as AppleTickerData,
    meta: {
      pageSource,
      related: [
        'components/Bars',
        'components/Points',
        'examples/Bars',
        'examples/Histogram',
        'examples/Sparkbar',
      ],
    },
  };
}
