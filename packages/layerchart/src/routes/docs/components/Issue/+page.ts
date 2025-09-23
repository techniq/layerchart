import api from '$lib/components/charts/AreaChart.svelte?raw&sveld';
import source from '$lib/components/charts/AreaChart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Area charts',
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Chart', 'components/Area', 'examples/Area'],
    },
  };
}
