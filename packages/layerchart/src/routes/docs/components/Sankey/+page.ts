import api from '$lib/components/Sankey.svelte?raw&sveld';
import source from '$lib/components/Sankey.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['examples/Sankey'],
    },
  };
}
