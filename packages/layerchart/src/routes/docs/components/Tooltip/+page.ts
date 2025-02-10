import api from '$lib/components/tooltip/Tooltip.svelte?raw&sveld';
import source from '$lib/components/tooltip/Tooltip.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      features: [
        'Various modes',
        [
          'bisect-x, bisect-y, bisect-band',
          'band',
          'bounds',
          'voronoi',
          'quadtree',
          'manual (ex. path, etc)',
        ],
        'Flexible positioning',
        [
          'mouse/pointer position with offset',
          'data snapping (x and/or y)',
          'fixed top and/or left',
          'mix and match',
        ],
        'Multiple instances',
        'Maintain within chart container, window/viewport, or overflow outside',
        'Configurable hide delay to prevent accidental hiding when moving to tooltip',
      ],
      related: ['components/TooltipContext', 'components/Highlight'],
    },
  };
}
