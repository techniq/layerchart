import api from '$lib/components/Area.svelte?raw&sveld';
import source from '$lib/components/Area.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['examples/Area'],
    },
  };
}
