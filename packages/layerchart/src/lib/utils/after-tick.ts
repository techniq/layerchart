import { tick } from 'svelte';

/**
 * Executes a callback function after the next DOM update.
 * @param cb Callback function to be executed after the next DOM update
 */
export function afterTick(cb: () => void) {
  tick().then(cb);
}
