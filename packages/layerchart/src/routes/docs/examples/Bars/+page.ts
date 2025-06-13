import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      title: 'Bar Chart (Horizontal)',
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Bars', 'examples/Columns', 'examples/Histogram', 'charts/BarChart'],
    },
  };
}
