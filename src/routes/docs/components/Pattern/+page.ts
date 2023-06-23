import source from '$lib/components/Pattern.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource
    }
  };
}
