import { autoType, csvParse } from 'd3-dsv';
import type { USSenatorsData } from '$static/data/examples/us-senators.js';

import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    usSenators: (await fetch('/data/examples/us-senators.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    )) as USSenatorsData,
    meta: {
      pageSource,
    },
  };
}
