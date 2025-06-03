import api from '$lib/components/Ellipse.svelte?raw&sveld';
import source from '$lib/components/Ellipse.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: '`<ellipse>` element with tweened properties using `motionStore`',
    },
  };
}
