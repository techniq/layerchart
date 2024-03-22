import { geoCentroid } from 'd3-geo';
import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    geojson: await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    ),
    earthquakes: await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson'
    )
      .then((r) => r.json())
      .then((d) =>
        d.features.map((f) => {
          console.log({ f });
          const c = geoCentroid(f);
          return {
            place: f.properties.place,
            magnitude: f.properties.mag,
            longitude: c[0],
            latitude: c[1],
          };
        })
      ),
    meta: {
      pageSource,
    },
  };
}
