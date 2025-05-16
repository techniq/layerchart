import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    chartData: (await fetch('/data/examples/bench/series_arrays/data.json').then((r) =>
      r.json()
    )) as {
      cpu: {
        x: Date;
        y: Number;
      }[];
      ram: {
        x: Date;
        y: Number;
      }[];
      tcp: {
        x: Date;
        y: Number;
      }[];
    },
    meta: {
      description: 'Array per series, each with `x` / `y` items',
      pageSource,
      hideTableOfContents: true,
    },
  };
}
