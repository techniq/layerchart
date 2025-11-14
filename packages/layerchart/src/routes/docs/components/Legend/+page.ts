import api from '$lib/components/Legend.svelte?raw&sveld';
import source from '$lib/components/Legend.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['html'],
    },
  };
}
