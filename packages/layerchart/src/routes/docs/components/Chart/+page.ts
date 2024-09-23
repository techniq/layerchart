import api from '$lib/components/Chart.svelte?raw&sveld';
import source from '$lib/components/Chart.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        'Sets up chart context, including dimension scales and additional contexts such as `TooltipContext`, `GeoContext`, and `TransformContext`. See also simplified charts such as `AreaChart` and `BarChart` for streamline configuration',
      features: ['Adds support for x and y baselines (always show 0, etc)'],
      related: [
        'components/AreaChart',
        'components/BarChart',
        'components/TooltipContext',
        'components/GeoContext',
      ],
    },
  };
}
