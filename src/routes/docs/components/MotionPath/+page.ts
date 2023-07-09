import api from '$lib/components/MotionPath.svelte?raw&sveld';
import source from '$lib/components/MotionPath.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Animate an object along a path'
    }
  };
}
