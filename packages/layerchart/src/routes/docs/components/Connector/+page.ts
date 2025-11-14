import api from '$lib/components/Connector.svelte?raw&sveld';
import source from '$lib/components/Connector.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Link', 'examples/Tree'],
    },
  };
}
