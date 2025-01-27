/**
 * Useful to workaround Svelte 3/4 markup type issues
 * TODO: Remove usage after migrating to Svelte 5
 */
export function asAny(x: any): any {
  return x;
}
