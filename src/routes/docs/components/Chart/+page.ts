import api from '$lib/components/Chart.svelte?raw&sveld';
import source from '$lib/components/Chart.svelte?raw';
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
