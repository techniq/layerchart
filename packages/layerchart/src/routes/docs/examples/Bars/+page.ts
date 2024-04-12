import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      title: 'Bar Chart (Horizontal)',
      pageSource,
      related: ['components/Bars', 'examples/Columns', 'examples/Histogram'],
    },
  };
}
