import { objectId } from '@layerstack/utils/object';

// TODO: investigate if this is necessary with Svelte 5
export function createKey<T>(getValue: () => T) {
  const value = $derived(getValue());
  const key = $derived(value && typeof value === 'object' ? objectId(value) : value);
  return {
    get current() {
      return key;
    },
  };
}
