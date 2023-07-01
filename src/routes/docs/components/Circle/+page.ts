import api from '$lib/components/Circle.svelte?raw&sveld';
import source from '$lib/components/Circle.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: '`<circle>` with tweened `x`, `y`, and `r` using `motionStore`'
    }
  };
}
