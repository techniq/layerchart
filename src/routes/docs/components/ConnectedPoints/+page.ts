import api from '$lib/components/ConnectedPoints.svelte?raw&sveld';
import source from '$lib/components/ConnectedPoints.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/ClevelandDotPlot'],
    },
  };
}
