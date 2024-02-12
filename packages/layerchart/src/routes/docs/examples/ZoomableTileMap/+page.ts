import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    geojson: await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then((r) =>
      r.json()
    ),
    meta: {
      pageSource,
    },
  };
}
