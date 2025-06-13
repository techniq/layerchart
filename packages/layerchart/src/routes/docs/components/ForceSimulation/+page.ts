import api from '$lib/components/ForceSimulation.svelte?raw&sveld';
import source from '$lib/components/ForceSimulation.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: [
        'examples/Beeswarm',
        'examples/CollisionDetection',
        'examples/ForceGroup',
        'examples/ForceLattice',
        'examples/ForceTree',
      ],
    },
  };
}
