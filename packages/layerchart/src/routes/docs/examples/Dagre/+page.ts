import { range } from 'd3-array';
import { randomInteger } from '@layerstack/utils';
import { unique } from '@layerstack/utils/array';

import pageSource from './+page.svelte?raw';

export async function load({ fetch }) {
  const alpha = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));

  function getRandomDownstreamIds(index: number) {
    return unique(range(randomInteger(1, 3)).map(() => randomInteger(index + 1, 25)));
  }

  const simpleGenerated = {
    nodes: alpha.map((a) => ({
      id: a,
    })),
    links: alpha.flatMap((a, i) => {
      if (i === 25) {
        return [];
      } else {
        const randomDownstreamId = randomInteger(i + 1, 25);
        const edge = { source: a, target: alpha[randomDownstreamId] };
        return [edge];
      }
    }),
  };

  const complexGenerated = {
    nodes: alpha.map((a) => ({
      id: a,
    })),
    links: alpha.flatMap((a, i) => {
      if (i === 25) {
        return [];
      } else {
        return getRandomDownstreamIds(i).map((id) => {
          return { source: a, target: alpha[id] };
        });
      }
    }),
  };

  return {
    basic: await fetch('/data/examples/graph/basic.json').then((r) => r.json()),
    simple: await fetch('/data/examples/graph/simple.json').then((r) => r.json()),
    complex: await fetch('/data/examples/graph/complex.json').then((r) => r.json()),
    miserables: await fetch('/data/examples/graph/miserables.json').then((r) => r.json()),
    tcpState: await fetch('/data/examples/graph/tcp-state.json').then((r) => r.json()),
    softwareUserFlow: await fetch('/data/examples/graph/software-user-flow.json').then((r) =>
      r.json()
    ),
    cluster: await fetch('/data/examples/graph/cluster.json').then((r) => r.json()),
    medium: await fetch('/data/examples/graph/dag-medium.json').then((r) => r.json()),
    large: await fetch('/data/examples/graph/dag-large.json').then((r) => r.json()),
    simpleGenerated,
    complexGenerated,

    meta: {
      pageSource,
      supportedContexts: ['svg'], // TODO: `canvas` coming soon
      related: ['components/Dagre', 'components/Link'],
    },
  };
}
