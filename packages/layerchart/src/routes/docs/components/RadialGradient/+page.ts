import api from '$lib/components/RadialGradient.svelte?raw&sveld';
import source from '$lib/components/RadialGradient.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/LinearGradient', 'components/Pattern'],
    },
  };
}
