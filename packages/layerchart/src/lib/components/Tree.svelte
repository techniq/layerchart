<script lang="ts">
  import { type HierarchyPointNode, tree as d3Tree } from 'd3-hierarchy';
  import { chartContext } from './ChartContext.svelte';

  const { data, width, height, padding } = chartContext();

  /**
   * Sets this tree layout’s node size to the specified two-element array of numbers `[width, height]`.
   * If unset, layout size is used instead.  When a node size is specified, the root node is always
   * positioned at `⟨0, 0⟩`.
   *
   * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
   */
  export let nodeSize: [number, number] | undefined = undefined;

  /**
   * see: https://github.com/d3/d3-hierarchy#tree_separation
   */
  export let separation: (a: HierarchyPointNode<any>, b: HierarchyPointNode<any>) => number =
    undefined;

  export let orientation: 'vertical' | 'horizontal' = 'horizontal';

  let tree;
  $: {
    tree = d3Tree().size(orientation === 'horizontal' ? [$height, $width] : [$width, $height]);

    if (nodeSize) {
      tree.nodeSize(nodeSize);
    }
    if (separation) {
      tree.separation(separation);
    }
  }

  $: treeData = tree($data);
</script>

<slot nodes={treeData.descendants()} links={treeData.links()} />
