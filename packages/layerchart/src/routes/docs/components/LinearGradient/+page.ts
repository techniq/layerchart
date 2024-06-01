import api from '$lib/components/LinearGradient.svelte?raw&sveld';
import source from '$lib/components/LinearGradient.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/RadialGradient', 'components/Pattern'],
    },
  };
}
