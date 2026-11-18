import { describe, it, expect } from 'vitest';
import {
  sankeyLayout,
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
  type SankeyAlign,
  type SankeyNode,
} from './sankeyLayout.js';

// A short branch (A → G) and a late source (F → E) so each alignment places them differently
function graph() {
  return {
    nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((name) => ({ name })),
    links: (
      [
        ['A', 'C', 5],
        ['B', 'C', 3],
        ['B', 'D', 2],
        ['C', 'E', 6],
        ['D', 'E', 1],
        ['A', 'G', 2],
        ['F', 'E', 2],
      ] as const
    ).map(([source, target, value]) => ({ source, target, value })),
  };
}

function layout(nodeAlign: SankeyAlign = sankeyJustify) {
  return sankeyLayout(graph(), {
    size: [100, 50],
    nodeId: (d) => d.name,
    nodeAlign,
    nodeWidth: 10,
    nodePadding: 4,
  });
}

const round = (n: number | undefined) => Math.round(n! * 100) / 100;
const positions = (nodes: SankeyNode<any, any>[]) =>
  nodes.map((n) => [n.name, round(n.x0), round(n.y0), round(n.y1)]);

// Expected values are d3-sankey 0.12.3's output for the same graph
describe('sankeyLayout', () => {
  it.each([
    [
      'justify',
      sankeyJustify,
      [
        ['A', 0, 0, 21],
        ['B', 0, 25, 40],
        ['C', 45, 1.66, 25.66],
        ['D', 45, 35.61, 41.61],
        ['E', 90, 0, 27],
        ['F', 0, 44, 50],
        ['G', 90, 31, 37],
      ],
    ],
    [
      'left',
      sankeyLeft,
      [
        ['A', 0, 0, 21],
        ['B', 0, 25, 40],
        ['C', 45, 0, 24],
        ['D', 45, 38, 44],
        ['E', 90, 10.06, 37.06],
        ['F', 0, 44, 50],
        ['G', 45, 28, 34],
      ],
    ],
    [
      'right',
      sankeyRight,
      [
        ['A', 0, 0, 24.5],
        ['B', 0, 28.5, 46],
        ['C', 45, 0, 28],
        ['D', 45, 43, 50],
        ['E', 90, 0, 31.5],
        ['F', 45, 32, 39],
        ['G', 90, 35.5, 42.5],
      ],
    ],
    [
      'center',
      sankeyCenter,
      [
        ['A', 0, 0, 19],
        ['B', 0, 23, 36.57],
        ['C', 45, 0, 21.71],
        ['D', 45, 35.14, 40.57],
        ['E', 90, 7.65, 32.08],
        ['F', 45, 44.57, 50],
        ['G', 45, 25.71, 31.14],
      ],
    ],
  ])('places nodes with %s alignment', (_, align, expected) => {
    expect(positions(layout(align).nodes)).toEqual(expected);
  });

  it('positions and sizes links, replacing ids with nodes', () => {
    const { nodes, links } = layout();
    expect(links.map((l) => [round(l.y0), round(l.y1), round(l.width)])).toEqual([
      [7.5, 9.16, 15],
      [29.5, 21.16, 9],
      [37, 38.61, 6],
      [10.66, 9, 18],
      [37.11, 19.5, 3],
      [18, 34, 6],
      [47, 24, 6],
    ]);
    expect(links[0].source).toBe(nodes[0]);
    expect(links[0].target).toBe(nodes[2]);
    expect(nodes[2].sourceLinks).toEqual([links[3]]);
    expect(nodes[2].targetLinks).toEqual([links[0], links[1]]);
  });

  it('uses `fixedValue` over link totals', () => {
    const g = graph();
    Object.assign(g.nodes[6], { fixedValue: 10 });
    const { nodes } = sankeyLayout(g, {
      size: [100, 50],
      nodeId: (d) => d.name,
      nodeAlign: sankeyJustify,
      nodeWidth: 10,
      nodePadding: 4,
    });
    expect(nodes[6].value).toBe(10);
    expect(nodes[2].value).toBe(8);
  });

  it('throws on a circular link or a missing node', () => {
    const options = {
      size: [100, 50] as [number, number],
      nodeId: (d: any) => d.name,
      nodeAlign: sankeyJustify,
      nodeWidth: 10,
      nodePadding: 4,
    };
    const nodes = [{ name: 'A' }, { name: 'B' }];
    expect(() =>
      sankeyLayout(
        {
          nodes,
          links: [
            { source: 'A', target: 'B', value: 1 },
            { source: 'B', target: 'A', value: 1 },
          ],
        },
        options
      )
    ).toThrow('circular link');
    expect(() =>
      sankeyLayout({ nodes, links: [{ source: 'A', target: 'Z', value: 1 }] }, options)
    ).toThrow('missing: Z');
  });
});
