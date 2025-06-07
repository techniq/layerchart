import api from '$lib/components/TransformContext.svelte?raw&sveld';
import source from '$lib/components/TransformContext.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas', 'html'],
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
