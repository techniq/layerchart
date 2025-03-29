import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    chartData: (await fetch('/data/examples/bench/wide_data/data.json').then((r) => r.json())) as {
      epoch: number;
      idl: number;
      recv: number;
      send: number;
      writ: number;
      used: number;
      free: number;
    }[],
    meta: {
      description: 'Wide data (property per series).  Pre-processed before passed to LineChart',
      pageSource,
      hideTableOfContents: true,
    },
  };
}
