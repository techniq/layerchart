import api from '$lib/components/Tooltip.svelte?raw&sveld';
import source from '$lib/components/Tooltip.svelte?raw';
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
