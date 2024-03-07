import api from '$lib/components/GeoEdgeFade.svelte?raw&sveld';
import source from '$lib/components/GeoEdgeFade.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/LoftedArcs'],
    },
  };
}
