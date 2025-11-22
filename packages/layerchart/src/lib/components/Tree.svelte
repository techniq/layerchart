<script lang="ts" module>
  export type TreeProps<T> = {
    /** d3 hierarchy node */
    hierarchy: HierarchyNode<T>;

    /**
     * Sets this tree layout’s node size to the specified two-element array of numbers `[width, height]`.
     * If unset, layout size is used instead.  When a node size is specified, the root node is always
     * positioned at `⟨0, 0⟩`.
     *
     * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
     */
    nodeSize?: [number, number];

    /**
     * see: https://github.com/d3/d3-hierarchy#tree_separation
     */
    separation?: (a: HierarchyPointNode<any>, b: HierarchyPointNode<any>) => number;

    /**
     * Orientation of the tree layout.
     *
     * @default 'horizontal'
     */
    orientation?: 'vertical' | 'horizontal';

    children?: Snippet<[{ nodes: HierarchyPointNode<any>[]; links: HierarchyPointLink<any>[] }]>;
  };
</script>

<script lang="ts" generics="T">
  import {
    type HierarchyPointNode,
    tree as d3Tree,
    type HierarchyPointLink,
    type HierarchyNode,
  } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    nodeSize,
    separation,
    orientation = 'horizontal',
    children,
    hierarchy,
  }: TreeProps<T> = $props();

  const ctx = getChartContext();

  const treeData = $derived.by(() => {
    const _tree = d3Tree<T>().size(
      orientation === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]
    );

    if (nodeSize) {
      _tree.nodeSize(nodeSize);
    }

    if (separation) {
      _tree.separation(separation);
    }

    if (hierarchy) {
      const h = hierarchy.copy();
      const treeData = _tree(h);
      return {
        links: treeData.links(),
        nodes: treeData.descendants(),
      };
    }

    return {
      links: [],
      nodes: [],
    };
  });
</script>

{@render children?.({
  nodes: treeData.nodes,
  links: treeData.links,
})}
