import source from '$lib/components/ChartClipPath.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource,
      description:
        'Convenient way to clip specific components (axis labels, etc) within chart while still allowing some to overflow (tooltips, etc)'
    }
  };
}
