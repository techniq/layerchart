<script lang="ts" module>
  export type TreeProps = {
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

<script lang="ts">
  import { type HierarchyPointNode, tree as d3Tree, type HierarchyPointLink } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';
  import { getChartContext } from './Chart-Next.svelte';

  let { nodeSize, separation, orientation = 'horizontal', children }: TreeProps = $props();

  const ctx = getChartContext();

  const tree = $derived.by(() => {
    const _tree = d3Tree().size(
      orientation === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height]
    );

    if (nodeSize) {
      _tree.nodeSize(nodeSize);
    }

    if (separation) {
      _tree.separation(separation);
    }
    return _tree;
  });

  // @ts-expect-error
  const treeData = $derived(tree(ctx.data));
</script>

{@render children?.({ nodes: treeData.descendants(), links: treeData.links() })}
