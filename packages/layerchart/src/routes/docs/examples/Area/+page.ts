import { parse } from 'svelte-ux';

import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    appleStock: await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
      parse(await r.text())
    ),
    meta: {
      pageSource,
    },
  };
}
