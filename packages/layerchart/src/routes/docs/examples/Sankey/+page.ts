import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    meta: {
      pageSource,
      related: ['components/Sankey', 'components/Link'],
    },
  };
}
