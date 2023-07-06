import api from '$lib/components/Bounds.svelte?raw&sveld';
import source from '$lib/components/Bounds.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['examples/Partition', 'examples/Sunburst', 'examples/Treemap']
    }
  };
}
