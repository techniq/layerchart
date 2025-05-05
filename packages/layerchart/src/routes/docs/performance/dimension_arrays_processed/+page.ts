import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    chartData: (await fetch('/data/examples/bench/dimension_arrays/data.json').then((r) =>
      r.json()
    )) as {
      date: Number[];
      cpu: Number[];
      ram: Number[];
      tcp: Number[];
    },
    meta: {
      description:
        'Individual arrays per dimension, similar to uplot.  Pre-processed before passed to LineChart',
      pageSource,
      hideTableOfContents: true,
    },
  };
}
