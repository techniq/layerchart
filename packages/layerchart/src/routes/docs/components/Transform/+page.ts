import api from '$lib/components/Transform.svelte?raw&sveld';
import source from '$lib/components/Transform.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: [
        'examples/Pack',
        'examples/Tree',
        'examples/ZoomableMap',
        'examples/ZoomableTileMap',
        'examples/LoftedArcsGlobe',
      ],
    },
  };
}
