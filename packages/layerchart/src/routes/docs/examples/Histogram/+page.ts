import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    olympians: await fetch('/data/examples/olympians.json').then((r) => r.json()),
    meta: {
      pageSource,
      related: ['components/Bars', 'examples/Bars', 'examples/Columns'],
    },
  };
}
