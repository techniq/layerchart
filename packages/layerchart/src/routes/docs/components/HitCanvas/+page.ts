import api from '$lib/components/Voronoi.svelte?raw&sveld';
import source from '$lib/components/Voronoi.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    geojson: await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json').then(
      (r) => r.json()
    ),
    meta: {
      api,
      source,
      pageSource,
      description:
        'Hidden color-coded lookup to enable shape-based tooltips when using Canvas (ex. GeoPath)',
      related: [
        'examples/GeoPath',
        'examples/Choropleth',
        'examples/BubbleMap',
        'examples/SpikeMap',
      ],
    },
  };
}
