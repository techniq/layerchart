import api from '$lib/components/Line.svelte?raw&sveld';
import source from '$lib/components/Line.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: '`<line>` with tweened `x`, `y`, `width` and `height` using `motionStore`'
    }
  };
}
