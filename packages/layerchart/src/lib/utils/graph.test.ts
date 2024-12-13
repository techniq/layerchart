import { describe, it, expect } from 'vitest';
import dagre from '@dagrejs/dagre';
import { ancestors, descendants } from './graph.js';

const exampleGraph = {
  nodes: [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' },
    { id: 'G' },
    { id: 'H' },
    { id: 'I' },
  ],
  edges: [
    { source: 'A', target: 'B' },
    { source: 'C', target: 'B' },
    { source: 'B', target: 'E' },
    { source: 'B', target: 'F' },
    { source: 'D', target: 'E' },
    { source: 'D', target: 'F' },
    { source: 'E', target: 'H' },
    { source: 'G', target: 'H' },
    { source: 'H', target: 'I' },
  ],
};

function buildGraph(data: typeof exampleGraph) {
  const g = new dagre.graphlib.Graph();

  g.setGraph({});

  data.nodes.forEach((n) => {
    g.setNode(n.id, {
      label: n.id,
    });
  });

  data.edges.forEach((e) => {
    g.setEdge(e.source, e.target);
  });

  return g;
}

describe('accessors', () => {
  it('start of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = ancestors(graph, 'A');
    expect(actual).length(0);
  });

  it('middle of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = ancestors(graph, 'E');
    expect(actual).to.have.members(['A', 'B', 'C', 'D']);
  });

  it('end of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = ancestors(graph, 'I');
    expect(actual).to.have.members(['A', 'B', 'C', 'D', 'E', 'G', 'H']);
  });

  it('max depth', () => {
    const graph = buildGraph(exampleGraph);
    const actual = ancestors(graph, 'H', 2);
    expect(actual).to.have.members(['B', 'D', 'E', 'G']);
  });
});

describe('descendants', () => {
  it('start of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = descendants(graph, 'A');
    expect(actual).to.have.members(['B', 'E', 'F', 'H', 'I']);
  });

  it('middle of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = descendants(graph, 'E');
    expect(actual).to.have.members(['H', 'I']);
  });

  it('end of graph ', () => {
    const graph = buildGraph(exampleGraph);
    const actual = descendants(graph, 'I');
    expect(actual).length(0);
  });

  it('max depth', () => {
    const graph = buildGraph(exampleGraph);
    const actual = descendants(graph, 'B', 2);
    expect(actual).to.have.members(['E', 'F', 'H']);
  });
});
