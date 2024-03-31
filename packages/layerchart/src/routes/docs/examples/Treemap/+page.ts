import { csvParse, autoType } from 'd3-dsv';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    cars: await fetch('/data/examples/cars.csv').then(async (r) =>
      csvParse(await r.text(), autoType)
    ),
    meta: {
      pageSource,
    },
  };
}
