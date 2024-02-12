import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    geojson: await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((r) =>
      r.json()
    ),
    meta: {
      pageSource,
    },
  };
}
