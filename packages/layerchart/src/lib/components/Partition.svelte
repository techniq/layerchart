<script lang="ts">
  import { partition as d3Partition } from 'd3-hierarchy';
  import { chartContext } from './ChartContext.svelte';

  const { data, width, height } = chartContext();

  export let orientation: 'vertical' | 'horizontal' = 'horizontal';

  export let size: [number, number] | undefined = undefined;

  /**
   * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
   */
  export let padding: number | undefined = undefined;

  /**
   * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
   */
  export let round: boolean | undefined = undefined;

  let partition: ReturnType<typeof d3Partition>;
  $: {
    partition = d3Partition().size(
      size ?? (orientation === 'horizontal' ? [$height, $width] : [$width, $height])
    );

    if (padding) {
      partition.padding(padding);
    }
    if (round) {
      partition.round(round);
    }
  }

  // @ts-ignore
  $: partitionData = partition($data);
</script>

<slot nodes={partitionData.descendants()} />
