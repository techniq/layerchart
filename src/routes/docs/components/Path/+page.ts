import source from '$lib/components/Partition.svelte?raw';
import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    meta: {
      source,
      pageSource,
      description:
        '`<path>` using `d3-shape` line generator to support `curve` and `defined`.  Works as data-driven via context or `data` prop, or pre-made `pathData`.  Adding tweening via `d3-interpolate-path`'
    }
  };
}
