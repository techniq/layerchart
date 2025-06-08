import api from '$lib/components/GeoContext.svelte?raw&sveld';
import source from '$lib/components/GeoContext.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        'Setup geo context, particularly the projection used by other geo components.  Typically used indirectly via the `geo` prop on Chart',
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Chart'],
    },
  };
}
