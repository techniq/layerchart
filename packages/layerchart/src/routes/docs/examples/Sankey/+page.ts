import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    simple: await fetch('/data/examples/graph/simple.json').then((r) => r.json()),
    complex: await fetch('/data/examples/graph/complex.json').then((r) => r.json()),
    greenhouse: await fetch('/data/examples/graph/greenhouse.json').then((r) => r.json()),
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),

    meta: {
      pageSource,
      related: ['components/Sankey', 'components/Link'],
    },
  };
}
