import api from '$lib/components/Bar.svelte?raw&sveld';
import source from '$lib/components/Bar.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Bars', 'examples/Bars', 'examples/Columns'],
    },
  };
}
