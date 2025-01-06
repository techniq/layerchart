import api from '$lib/components/ClipPath.svelte?raw&sveld';
import source from '$lib/components/ClipPath.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      related: [
        'components/ChartClipPath',
        'components/CircleClipPath',
        'components/RectClipPath',
        'components/Threshold',
        'examples/GeoTile',
        'examples/Timezones',
      ],
    },
  };
}
