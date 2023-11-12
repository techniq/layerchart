import api from '$lib/components/Graticule.svelte?raw&sveld';
import source from '$lib/components/Graticule.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/AnimatedGlobe', 'examples/GeoProjection', 'examples/LoftedArcsGlobe'],
    },
  };
}
