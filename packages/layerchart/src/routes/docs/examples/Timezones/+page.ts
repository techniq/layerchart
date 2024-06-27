import type { GeometryCollection, Topology } from 'topojson-specification';
import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  // TODO: Support different US (https://github.com/topojson/us-atlas) and World (https://github.com/topojson/world-atlas) files
  // TODO: Cache: https://github.com/sveltejs/kit/issues/3642
  return {
    geojson: (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(
      (r) => r.json()
    )) as Topology<{
      countries: GeometryCollection<{ name: string }>;
      land: GeometryCollection;
    }>,
    timezones: (await fetch('/data/examples/geo/timezones.json').then((r) =>
      r.json()
    )) as Topology<{
      timezones: GeometryCollection<{
        objectid: number;
        scalerank: number;
        featurecla: string;
        name: string;
        map_color6: number;
        map_color8: number;
        note: any;
        zone: number;
        utc_format: string;
        time_zone: string;
        iso_8601: string;
        places: string;
        dst_places: any;
        tz_name1st: any;
        tz_namesum: number;
      }>;
    }>,

    meta: {
      pageSource,
      related: [
        'components/Blur',
        'components/GeoCircle',
        'components/GeoPath',
        'components/ClipPath',
        'components/Graticule',
      ],
    },
  };
}
