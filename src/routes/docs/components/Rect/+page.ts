import source from '$lib/components/Rect.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource,
      description: '`<rect>` with tweened `x`, `y`, `width` and `height` using `motionStore`'
    }
  };
}
