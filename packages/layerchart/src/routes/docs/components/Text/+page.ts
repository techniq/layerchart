import api from '$lib/components/Text.svelte?raw&sveld';
import source from '$lib/components/Text.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      api,
      source,
      pageSource,
      supportedContexts: ['svg', 'canvas', 'html'],
      features: [
        'Adjustable anchor/origin point (center horizontally and vertically)',
        'Rotate (based on origin)',
        'Multiline wrapping',
        'Scale to fit',
        'Easy offset with `dx` and `dy`',
      ],
    },
  };
}
