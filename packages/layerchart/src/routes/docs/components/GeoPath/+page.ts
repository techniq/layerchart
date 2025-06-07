import api from '$lib/components/GeoPath.svelte?raw&sveld';
import source from '$lib/components/GeoPath.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: [
        'components/Graticule',
        'examples/AnimatedGlobe',
        'examples/BubbleMap',
        'examples/Choropleth',
        'examples/CountryMap',
        'examples/GeoPath',
        'examples/GeoPoint',
        'examples/GeoProjection',
        'examples/GeoTile',
        'examples/LoftedArcsGlobe',
        'examples/SpikeMap',
        'examples/StateMap',
        'examples/ZoomableMap',
        'examples/ZoomableTileMap',
      ],
    },
  };
}
