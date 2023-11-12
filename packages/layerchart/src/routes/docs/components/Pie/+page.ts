import api from '$lib/components/Pie.svelte?raw&sveld';
import source from '$lib/components/Pie.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Arc', 'examples/Arc'],
    },
  };
}
