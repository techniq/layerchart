import api from '$lib/components/Tooltip.svelte?raw&sveld';
import source from '$lib/components/Tooltip.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      features: [
        'Various modes, including:',
        ['bisect-[x|y|band]', 'band', 'bounds', 'voronoi', 'quadtree', 'manual (ex. path, etc)'],
        'Flexible positioning, including:',
        [
          'mouse/pointer position with offset',
          'data snapping (x and/or y)',
          'fixed top and/or left',
        ],
        'Multiple instances',
      ],
      related: ['components/TooltipContext', 'components/Highlight'],
    },
  };
}
