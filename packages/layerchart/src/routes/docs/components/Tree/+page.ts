import api from '$lib/components/Tree.svelte?raw&sveld';
import source from '$lib/components/Tree.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Tree'],
    },
  };
}
