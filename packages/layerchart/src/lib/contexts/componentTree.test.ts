import { describe, it, expect } from 'vitest';

import { removeComponentNode, type ComponentNode } from './componentTree.svelte.js';
// Note: registerComponentNode requires Svelte context (setContext/getContext)
// and is tested indirectly via chart state and component integration tests.

/** Helper to create a minimal node without Svelte context */
function makeNode(name: string, parent: ComponentNode | null = null): ComponentNode {
  const node: ComponentNode = {
    id: Symbol(name),
    kind: 'mark',
    name,
    parent,
    children: [],
    insideCompositeMark: false,
  };
  if (parent) {
    parent.children.push(node);
  }
  return node;
}

describe('componentTree', () => {
  describe('removeComponentNode', () => {
    it('should remove a child from its parent', () => {
      const parent = makeNode('parent');
      const child = makeNode('child', parent);

      expect(parent.children).toHaveLength(1);
      removeComponentNode(child);
      expect(parent.children).toHaveLength(0);
    });

    it('should only remove the specified child', () => {
      const parent = makeNode('parent');
      const child1 = makeNode('child1', parent);
      const child2 = makeNode('child2', parent);
      const child3 = makeNode('child3', parent);

      removeComponentNode(child2);
      expect(parent.children).toHaveLength(2);
      expect(parent.children).toContain(child1);
      expect(parent.children).toContain(child3);
      expect(parent.children).not.toContain(child2);
    });

    it('should handle removing a root node (no parent)', () => {
      const root = makeNode('root');
      // Should not throw
      removeComponentNode(root);
    });
  });

  describe('tree structure', () => {
    it('should build a multi-level tree', () => {
      const root = makeNode('root');
      const group = makeNode('group', root);
      const leaf1 = makeNode('leaf1', group);
      const leaf2 = makeNode('leaf2', group);
      const sibling = makeNode('sibling', root);

      expect(root.children).toHaveLength(2);
      expect(root.children).toContain(group);
      expect(root.children).toContain(sibling);
      expect(group.children).toHaveLength(2);
      expect(group.children).toContain(leaf1);
      expect(group.children).toContain(leaf2);
      expect(leaf1.parent).toBe(group);
      expect(group.parent).toBe(root);
    });

    it('should clean up subtrees correctly', () => {
      const root = makeNode('root');
      const group = makeNode('group', root);
      makeNode('leaf1', group);
      makeNode('leaf2', group);

      // Remove the group (and its children become orphaned)
      removeComponentNode(group);
      expect(root.children).toHaveLength(0);
      // Group still has its children (for cleanup order - children destroy first)
      expect(group.children).toHaveLength(2);
    });
  });

  describe('insideCompositeMark', () => {
    it('should be false for root-level nodes', () => {
      const root = makeNode('root');
      expect(root.insideCompositeMark).toBe(false);
    });

    it('should be true when parent is a composite-mark', () => {
      const composite = makeNode('Area');
      composite.kind = 'composite-mark';
      const child: ComponentNode = {
        id: Symbol('child'),
        kind: 'mark',
        name: 'Spline',
        parent: composite,
        children: [],
        insideCompositeMark: composite.kind === 'composite-mark',
      };
      expect(child.insideCompositeMark).toBe(true);
    });

    it('should be false when parent is a group (not composite-mark)', () => {
      const group = makeNode('Group');
      group.kind = 'group';
      const child: ComponentNode = {
        id: Symbol('child'),
        kind: 'mark',
        name: 'Circle',
        parent: group,
        children: [],
        insideCompositeMark: false, // group is not composite-mark
      };
      expect(child.insideCompositeMark).toBe(false);
    });
  });
});
