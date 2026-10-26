import { describe, expect, it } from 'vitest';
import type { ComponentNode } from '$lib/states/chart.svelte.js';
import { paintOrder } from './renderTree.js';

function node(name: string, depth?: number): ComponentNode {
  return {
    id: Symbol(name),
    kind: 'mark',
    name,
    parent: null,
    children: [],
    insideCompositeMark: false,
    canvasRender: { render: () => {}, depth: () => depth },
  };
}

const names = (nodes: ComponentNode[]) => nodes.map((n) => n.name);

describe('paintOrder', () => {
  it('keeps mount order by default', () => {
    const parent = { ...node('parent'), children: [node('a', 3), node('b', 1), node('c', 2)] };
    expect(names(paintOrder(parent))).toEqual(['a', 'b', 'c']);
  });

  it('paints children back to front by depth for `paintByDepth`', () => {
    const parent = {
      ...node('parent'),
      paintByDepth: true,
      children: [node('a', 3), node('b', 1), node('c', 2)],
    };
    expect(names(paintOrder(parent))).toEqual(['b', 'c', 'a']);
  });

  it('keeps equal depths, and children without one, where they mounted', () => {
    const parent = {
      ...node('parent'),
      paintByDepth: true,
      children: [node('a', 2), node('b', 1), node('label'), node('c', 1), node('d', 0)],
    };
    // `label` splits the runs; `c` before `d` only within its own run
    expect(names(paintOrder(parent))).toEqual(['b', 'a', 'label', 'd', 'c']);
  });
});
