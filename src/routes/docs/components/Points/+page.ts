import api from '$lib/components/Points.svelte?raw&sveld';
import source from '$lib/components/Points.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource
    }
  };
}
