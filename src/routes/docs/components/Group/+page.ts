import api from '$lib/components/Group.svelte?raw&sveld';
import source from '$lib/components/Group.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: [
        'examples/Pack',
        'examples/Partition',
        'examples/Sankey',
        'examples/SpikeMap',
        'examples/Sunburst',
        'examples/Tree',
        'examples/Treemap'
      ]
    }
  };
}
