import api from '$lib/components/TransformContext.svelte?raw&sveld';
import source from '$lib/components/Transform.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: [
        'components/Chart',
        'examples/Pack',
        'examples/Tree',
        'examples/ZoomableMap',
        'examples/ZoomableTileMap',
        'examples/LoftedArcsGlobe',
      ],
    },
  };
}
