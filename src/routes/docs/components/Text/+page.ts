import source from '$lib/components/Text.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      features: [
        'Rotate (based on origin)',
        'Multiline wrapping',
        'Scale to fit',
        'Adjustable anchor/origin point (center horizontally and vertically)',
        'Easy offset with `dx` and `dy`'
      ],
      source,
      pageSource
    }
  };
}
