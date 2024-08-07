import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      title: 'Bar Chart (Vertical)',
      pageSource,
      related: ['components/Bars', 'examples/Bars', 'examples/Histogram', 'examples/Sparkbar'],
    },
  };
}
