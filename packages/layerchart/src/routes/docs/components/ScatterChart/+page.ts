import api from '$lib/components/charts/ScatterChart.svelte?raw&sveld';
import source from '$lib/components/charts/ScatterChart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Scatter charts',
      related: ['components/Chart', 'components/Points', 'examples/Scatter'],
    },
  };
}
