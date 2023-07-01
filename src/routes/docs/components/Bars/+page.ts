import api from '$lib/components/Bars.svelte?raw&sveld';
import source from '$lib/components/Bars.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource
    }
  };
}
