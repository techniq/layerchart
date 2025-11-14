import api from '$lib/components/Axis.svelte?raw&sveld';
import source from '$lib/components/Axis.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas', 'html'],
      related: ['components/Grid', 'components/Rule'],
    },
  };
}
