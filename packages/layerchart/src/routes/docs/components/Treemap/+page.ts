import api from '$lib/components/Treemap.svelte?raw&sveld';
import source from '$lib/components/Treemap.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Treemap'],
    },
  };
}
