import api from '$lib/components/Blur.svelte?raw&sveld';
import source from '$lib/components/Blur.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
    },
  };
}
