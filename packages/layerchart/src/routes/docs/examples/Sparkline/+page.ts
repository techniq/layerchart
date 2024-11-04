import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      related: [
        'components/LineChart',
        'components/Spline',
        'components/Tooltip',
        'components/Highlight',
        'examples/Sparkbar',
      ],
    },
  };
}
