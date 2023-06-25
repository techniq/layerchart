import source from '$lib/components/Axis.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource
    }
  };
}
