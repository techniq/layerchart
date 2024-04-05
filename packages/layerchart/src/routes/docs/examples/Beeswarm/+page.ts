import { autoType, csvParse } from 'd3-dsv';

import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    usSenators: await fetch('/data/examples/us-senators.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    ),
    meta: {
      pageSource,
    },
  };
}
