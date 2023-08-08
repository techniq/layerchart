import api from '$lib/components/TooltipContext.svelte?raw&sveld';
import source from '$lib/components/TooltipContext.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        'Setup tooltip context, include mode to identify related data based on pointer position.  Typically used indirectly via the `tooltip` prop Chart',
      related: ['components/Chart', 'components/Tooltip', 'components/Highlight'],
    },
  };
}
