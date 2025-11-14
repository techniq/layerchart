import { autoType, csvParse } from 'd3-dsv';
import type { AlphabetData } from '$static/data/examples/alphabet.js';

import api from '$lib/components/Rule.svelte?raw&sveld';
import source from '$lib/components/Rule.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    alphabet: (await fetch('/data/examples/alphabet.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    )) as AlphabetData[],
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Axis', 'components/Line', 'examples/Candlestick', 'examples/Duration'],
    },
  };
}
