import api from '$lib/components/Link.svelte?raw&sveld';
import source from '$lib/components/Link.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Points', 'examples/Sankey', 'examples/Tree'],
    },
  };
}
