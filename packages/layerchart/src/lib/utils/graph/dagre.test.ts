import { describe, it, expect } from 'vitest';
import { dagreGraph, dagreAncestors, dagreDescendants } from './dagre.js';

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

describe('dagreAncestors', () => {
  it('start of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreAncestors(graph, 'L');
    expect(actual).length(0);
  });

  it('middle of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreAncestors(graph, 'E');
    expect(actual).to.have.members(['A', 'B', 'C', 'D']);
  });

  it('end of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreAncestors(graph, 'I');
    expect(actual).to.have.members(['A', 'B', 'C', 'D', 'E', 'G', 'H']);
  });

  it('max depth', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreAncestors(graph, 'H', 2);
    expect(actual).to.have.members(['B', 'D', 'E', 'G']);
  });
});

describe('dagreDescendants', () => {
  it('start of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreDescendants(graph, 'A');
    expect(actual).to.have.members(['B', 'E', 'F', 'H', 'I']);
  });

  it('middle of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreDescendants(graph, 'E');
    expect(actual).to.have.members(['H', 'I']);
  });

  it('end of graph ', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreDescendants(graph, 'I');
    expect(actual).length(0);
  });

  it('max depth', () => {
    const graph = dagreGraph(exampleGraph);
    const actual = dagreDescendants(graph, 'B', 2);
    expect(actual).to.have.members(['E', 'F', 'H']);
  });
});
