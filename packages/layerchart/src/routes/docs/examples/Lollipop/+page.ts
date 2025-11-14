import { autoType, csvParse } from 'd3-dsv';
import type { AlphabetData } from '$static/data/examples/alphabet.js';

import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    alphabet: (await fetch('/data/examples/alphabet.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    )) as AlphabetData[],
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Rule'],
    },
  };
}
