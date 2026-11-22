import { createSubscriber } from 'svelte/reactivity';
import { clearStringWidths } from './string.js';

let loads = 0;

const subscribe = createSubscriber((update) => {
  const fonts = document.fonts;
  const loaded = () => {
    clearStringWidths();
    loads++;
    update();
  };
  fonts.addEventListener('loadingdone', loaded);
  return () => fonts.removeEventListener('loadingdone', loaded);
});

/**
 * How many times web fonts have finished loading.  Read it where text is measured, so it measures
 * again once one has — a font arriving after the first measurement can measure wider.
 *
 * Listens only while something reactive reads it, so charts that never measure text pay nothing.
 */
export function fontsLoaded() {
  if (typeof document !== 'undefined' && document.fonts) subscribe();
  return loads;
}
