import api from '$lib/components/GeoCircle.svelte?raw&sveld';
import source from '$lib/components/GeoCircle.svelte?raw';
import pageSource from './+page.svelte?raw';
import type { GeometryCollection, Topology } from 'topojson-specification';

export async function load() {
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    )) as Topology<{
      countries: GeometryCollection<{ name: string }>;
    }>,
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Timezones'],
    },
  };
}
