import api from '$lib/components/GeoContext.svelte?raw&sveld';
import source from '$lib/components/GeoContext.svelte?raw';
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
