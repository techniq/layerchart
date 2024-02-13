import api from '$lib/components/GeoCircle.svelte?raw&sveld';
import source from '$lib/components/GeoCircle.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    geojson: await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    ),
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Timezones'],
    },
  };
}
