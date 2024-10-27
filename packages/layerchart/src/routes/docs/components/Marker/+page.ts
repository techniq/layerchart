import api from '$lib/components/Marker.svelte?raw&sveld';
import source from '$lib/components/Marker.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Graphic used for drawing arrowheads or polymarkers on Line, Spline, etc',
      related: ['components/Spline', 'components/Line', 'components/Rule', 'components/GeoPath'],
    },
  };
}
