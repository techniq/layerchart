import api from '$lib/components/ChartClipPath.svelte?raw&sveld';
import source from '$lib/components/ChartClipPath.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        'Convenient way to clip specific components (axis labels, etc) within chart while still allowing some to overflow (tooltips, etc)',
      related: [
        'components/RectClipPath',
        'components/Rect',
        'examples/Area',
        'examples/Partition',
        'examples/StateMap',
        'examples/Treemap',
      ],
    },
  };
}
