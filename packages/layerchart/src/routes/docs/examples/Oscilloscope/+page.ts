import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      related: [
        'components/Bars',
        'components/Spline',
        'examples/Bars',
        'examples/Histogram',
        'examples/Sparkbar',
      ],
    },
  };
}
