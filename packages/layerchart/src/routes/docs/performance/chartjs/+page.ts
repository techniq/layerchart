import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    chartData: (await fetch('/data/examples/bench/chartjs/data.json').then((r) => r.json())) as {
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
      pageSource,
      hideTableOfContents: true,
    },
  };
}
