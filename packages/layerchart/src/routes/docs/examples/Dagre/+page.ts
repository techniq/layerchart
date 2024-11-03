import pageSource from './+page.svelte?raw';

export async function load() {
  return {
    basic: await fetch('/data/examples/graph/basic.json').then((r) => r.json()),
    simple: await fetch('/data/examples/graph/simple.json').then((r) => r.json()),
    complex: await fetch('/data/examples/graph/complex.json').then((r) => r.json()),
    greenhouse: await fetch('/data/examples/graph/greenhouse.json').then((r) => r.json()),
    flare: await fetch('/data/examples/hierarchy/flare.json').then((r) => r.json()),
    miserables: await fetch('/data/examples/graph/miserables.json').then((r) => r.json()),
    tcpState: await fetch('/data/examples/graph/tcp-state.json').then((r) => r.json()),
    cluster: await fetch('/data/examples/graph/cluster.json').then((r) => r.json()),

    meta: {
      pageSource,
      related: ['components/Dagre', 'components/Link'],
    },
  };
}
