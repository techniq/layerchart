import api from '$lib/components/Group.svelte?raw&sveld';
import source from '$lib/components/Group.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        '`<g>` element with convenient x/y and center placement along with tweened properties using `motionStore`',
      supportedContexts: [
        'svg',
        // 'canvas' // TODO: Supported, but limited use cases
        'html',
      ],
      related: [
        'examples/Pack',
        'examples/Partition',
        'examples/Sankey',
        'examples/SpikeMap',
        'examples/Sunburst',
        'examples/Tree',
        'examples/Treemap',
      ],
    },
  };
}
