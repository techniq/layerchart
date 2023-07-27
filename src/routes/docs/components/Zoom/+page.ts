import api from '$lib/components/Zoom.svelte?raw&sveld';
import source from '$lib/components/Zoom.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
    },
  };
}
