import source from '$lib/components/Line.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource,
      description: '`<line>` with tweened `x`, `y`, `width` and `height` using `motionStore`'
    }
  };
}
