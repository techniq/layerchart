import api from '$lib/components/Arc.svelte?raw&sveld';
import source from '$lib/components/Arc.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Pie', 'examples/Arc'],
    },
  };
}
