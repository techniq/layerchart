import { parse } from 'svelte-ux';

import api from '$lib/components/Brush.svelte?raw&sveld';
import source from '$lib/components/Brush.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    appleStock: await fetch('/data/examples/date/apple-stock.json').then(async (r) =>
      parse(await r.text())
    ),
    meta: {
      api,
      source,
      pageSource,
    },
  };
}
