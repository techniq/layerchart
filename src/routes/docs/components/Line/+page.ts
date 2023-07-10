import api from '$lib/components/Line.svelte?raw&sveld';
import source from '$lib/components/Line.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: '`<line>` element with tweened properties using `motionStore`',
      related: ['components/Rule', 'components/Spline']
    }
  };
}
