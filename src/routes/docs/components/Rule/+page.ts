import api from '$lib/components/Rule.svelte?raw&sveld';
import source from '$lib/components/Rule.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Axis', 'components/Line']
    }
  };
}
