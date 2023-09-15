import api from '$lib/components/Highlight.svelte?raw&sveld';
import source from '$lib/components/Highlight.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: ['components/Tooltip', 'components/TooltipContext'],
    },
  };
}
