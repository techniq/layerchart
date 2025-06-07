import api from '$lib/components/Threshold.svelte?raw&sveld';
import source from '$lib/components/Threshold.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      description:
        'Areas between two values (`y={["value", "baseline"]}`) depending on which is greater (ex. green/red)',
      supportedContexts: ['svg'], // dependency on ClipPath getting canvas support
      related: ['examples/Threshold'],
    },
  };
}
