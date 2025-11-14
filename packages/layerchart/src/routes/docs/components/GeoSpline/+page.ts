import api from '$lib/components/GeoSpline.svelte?raw&sveld';
import source from '$lib/components/GeoSpline.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['examples/LoftedArcs'],
    },
  };
}
