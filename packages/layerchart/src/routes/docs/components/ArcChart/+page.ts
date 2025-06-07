import api from '$lib/components/charts/PieChart.svelte?raw&sveld';
import source from '$lib/components/charts/PieChart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Pie charts',
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Chart', 'components/Pie', 'examples/Arc'],
    },
  };
}
