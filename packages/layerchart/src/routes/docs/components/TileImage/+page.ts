import api from '$lib/components/TileImage.svelte?raw&sveld';
import source from '$lib/components/TileImage.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/GeoTile'],
    },
  };
}
