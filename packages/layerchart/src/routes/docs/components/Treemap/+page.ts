import api from '$lib/components/Treemap.svelte?raw&sveld';
import source from '$lib/components/Treemap.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Treemap'],
    },
  };
}
