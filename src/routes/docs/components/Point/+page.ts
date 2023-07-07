import api from '$lib/components/Point.svelte?raw&sveld';
import source from '$lib/components/Point.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Convenient way to translate a data item to SVG x/y coordinates',
      related: ['examples/Area']
    }
  };
}
