import { describe, it, expect } from 'vitest';
import { sankeyGraphFromCsv } from './sankey.js';

describe('sankeyGraphFromCsv', () => {
  it('parses source,target,value rows into links and distinct nodes', () => {
    const graph = sankeyGraphFromCsv('A,B,5\nA,C,3\nB,C,2');
    expect(graph.links).toEqual([
      { source: 'A', target: 'B', value: 5 },
      { source: 'A', target: 'C', value: 3 },
      { source: 'B', target: 'C', value: 2 },
    ]);
    expect(graph.nodes).toEqual([{ name: 'A' }, { name: 'B' }, { name: 'C' }]);
  });

  it('defaults a missing or non-numeric value to 1', () => {
    const graph = sankeyGraphFromCsv('A,B\nA,C,\nB,C,abc');
    expect(graph.links.map((l) => l.value)).toEqual([1, 1, 1]);
  });

  it('skips blank lines and rows without a source or target', () => {
    const graph = sankeyGraphFromCsv('\nA,B,1\n\nA\n,B,2\nB,C,3\n');
    expect(graph.links).toEqual([
      { source: 'A', target: 'B', value: 1 },
      { source: 'B', target: 'C', value: 3 },
    ]);
  });

  it('handles CRLF and CR line endings', () => {
    expect(sankeyGraphFromCsv('A,B,1\r\nB,C,2').links).toHaveLength(2);
    expect(sankeyGraphFromCsv('A,B,1\rB,C,2').links).toHaveLength(2);
  });
});
