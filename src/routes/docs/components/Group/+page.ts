import api from '$lib/components/Group.svelte?raw&sveld';
import source from '$lib/components/Group.svelte?raw';
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
