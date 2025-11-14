import pageSource from './+page.svelte?raw';
import type { OlympiansData } from '$static/data/examples/olympians.js';

export async function load({ fetch }) {
  return {
    olympians: (await fetch('/data/examples/olympians.json').then((r) =>
      r.json()
    )) as OlympiansData,
    meta: {
      pageSource,
      supportedContexts: ['svg', 'canvas'],
      related: ['components/Bars', 'examples/Bars', 'examples/Columns'],
    },
  };
}
