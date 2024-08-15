import api from '$lib/components/charts/BarChart.svelte?raw&sveld';
import source from '$lib/components/charts/BarChart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description: 'Streamlined Chart configuration for Bar charts',
      related: [
        'components/Chart',
        'components/Bars',
        'examples/Bars',
        'examples/Histogram',
        'examples/Sparkbar',
      ],
    },
  };
}
