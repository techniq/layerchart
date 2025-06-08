import api from '$lib/components/Polygon.svelte?raw&sveld';
import source from '$lib/components/Polygon.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
    },
  };
}
