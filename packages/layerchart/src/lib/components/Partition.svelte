<script lang="ts" module>
  import {
    partition as d3Partition,
    type HierarchyNode,
    type HierarchyRectangularNode,
  } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';

  export type PartitionProps = {
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

    children?: Snippet<[{ nodes: HierarchyRectangularNode<any>[] }]>;
  };
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';

  let { size, padding, round, orientation = 'horizontal', children }: PartitionProps = $props();

  const ctx = getChartContext();

  const partition = $derived.by(() => {
    const _partition = d3Partition().size(
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
  const partitionData = $derived(partition(ctx.data as HierarchyNode<any>));
</script>

{@render children?.({ nodes: partitionData.descendants() })}
