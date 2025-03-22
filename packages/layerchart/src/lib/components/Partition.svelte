<script lang="ts" module>
  import {
    partition as d3Partition,
    type HierarchyNode,
    type HierarchyRectangularNode,
  } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';

  export type PartitionProps<T> = {
    /**
     * The orientation of the partition layout.
     *
     * @default 'horizontal'
     */
    orientation?: 'vertical' | 'horizontal';

    /**
     * The size of the partition layout.
     */
    size?: [number, number];

    /**
     * The padding between nodes in the partition layout.
     * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
     */
    padding?: number;

    /**
     * The round property of the partition layout.
     * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
     */
    round?: boolean;

    hierarchy?: HierarchyNode<T>;

    children?: Snippet<[{ nodes: HierarchyRectangularNode<T>[] }]>;
  };
</script>

<script lang="ts" generics="T">
  import { getChartContext } from './Chart.svelte';

  let {
    size,
    padding,
    round,
    orientation = 'horizontal',
    hierarchy,
    children,
  }: PartitionProps<T> = $props();

  const ctx = getChartContext();

  const partition = $derived.by(() => {
    const _partition = d3Partition<T>().size(
      size ?? (orientation === 'horizontal' ? [ctx.height, ctx.width] : [ctx.width, ctx.height])
    );

    if (padding) {
      _partition.padding(padding);
    }

    if (round) {
      _partition.round(round);
    }
    return _partition;
  });
  const partitionData = $derived(hierarchy ? partition(hierarchy) : []);
</script>

{@render children?.({ nodes: 'descendants' in partitionData ? partitionData.descendants() : [] })}
