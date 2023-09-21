import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      pageSource,
      related: ['components/Spline', 'components/Tooltip', 'components/Highlight'],
    },
  };
}
