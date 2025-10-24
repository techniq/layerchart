import api from '$lib/components/Month.svelte?raw&sveld';
import source from '$lib/components/Month.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas', 'html'],
    },
  };
}
