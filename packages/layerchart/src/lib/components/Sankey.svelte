<script lang="ts">
  // https://github.com/d3/d3-sankey
  import { createEventDispatcher } from 'svelte';
  import {
    sankey as d3Sankey,
    sankeyLeft,
    sankeyCenter,
    sankeyRight,
    sankeyJustify,
    type SankeyNode,
  } from 'd3-sankey';

  import { chartContext } from './ChartContext.svelte';

  const dispatch = createEventDispatcher();

  const { data, width, height, padding } = chartContext();

  export let nodes = (d) => d.nodes;
  export let nodeId = (d) => d.index;
  /**
   * see: https://github.com/d3/d3-sankey#alignments
   */
  export let nodeAlign:
    | ((node: SankeyNode<any, any>, n: number) => number)
    | 'left'
    | 'right'
    | 'center'
    | 'justify' = sankeyJustify;
  export let nodeWidth = 4;
  export let nodePadding = 10;
  export let nodeSort = undefined;

  export let links = (d) => d.links;
  export let linkSort = undefined;

  $: sankey = d3Sankey()
    .size([$width, $height])
    .nodes(nodes)
    .nodeId(nodeId)
    .nodeAlign(
      nodeAlign === 'left'
        ? sankeyLeft
        : nodeAlign === 'center'
          ? sankeyCenter
          : nodeAlign === 'right'
            ? sankeyRight
            : nodeAlign === 'justify'
              ? sankeyJustify
              : nodeAlign
    )
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .nodeSort(nodeSort)
    .links(links)
    .linkSort(linkSort);

  $: sankeyData = sankey($data);

  $: dispatch('update', sankeyData);
</script>

<slot nodes={sankeyData.nodes} links={sankeyData.links} />
