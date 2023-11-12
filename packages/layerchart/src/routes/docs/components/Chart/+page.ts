import api from '$lib/components/Chart.svelte?raw&sveld';
import source from '$lib/components/Chart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Setup LakerCake chart context, along with tooltip and geo contexts',
      features: ['Adds support for x and y baselines (always show 0, etc)'],
      related: ['components/TooltipContext', 'components/GeoContext'],
    },
  };
}
