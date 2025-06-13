import api from '$lib/components/Calendar.svelte?raw&sveld';
import source from '$lib/components/Calendar.svelte?raw';
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
