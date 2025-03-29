<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type NodeExtraProperties = Record<string, any>;

  export type SankeyProps = {
    /**
     * The function to get the nodes from the data.
     * @default (d: any) => d.nodes
     */
    nodes?: (d: any) => any;

    /**
     * The function to get the node ID from the node data.
     *
     * @default (d: any) => d.index
     */
    nodeId?: (d: any) => any;
    /**
     * @see https://github.com/d3/d3-sankey#alignments
     *
     * @default sankeyJustify
     */
    nodeAlign?:
      | ((node: SankeyNode<any, any>, n: number) => number)
      | 'left'
      | 'right'
      | 'center'
      | 'justify';

    /**
     * The width of the nodes.
     *
     * @default 4
     */
    nodeWidth?: number;

    /**
     * The padding between nodes.
     *
     * @default 10
     */
    nodePadding?: number;

    /**
     * The function to sort the nodes.
     */
    nodeSort?: (a: SankeyNode<any, any>, b: SankeyNode<any, any>) => number | undefined;

    /**
     * The function to get the links from the data.
     *
     * @default (d: any) => d.links
     */
    links?: (d: any) => any;

    /**
     * The function to sort the links.
     *
     */
    linkSort?: (a: SankeyLink<any, any>, b: SankeyLink<any, any>) => number | undefined;

    /**
     * A function to be called when the data is updated.
     */
    onUpdate?: (data: SankeyGraph<{}, {}>) => void;

    children?: Snippet<
      [
        {
          nodes: SankeyNode<NodeExtraProperties, any>[];
          links: SankeyNode<NodeExtraProperties, any>[];
        },
      ]
    >;
  };
</script>

<script lang="ts">
  // https://github.com/d3/d3-sankey
  import {
    sankey as d3Sankey,
    sankeyLeft,
    sankeyCenter,
    sankeyRight,
    sankeyJustify,
    type SankeyNode,
    type SankeyLink,
    type SankeyGraph,
  } from 'd3-sankey';

  import { getChartContext } from './Chart.svelte';

  let {
    nodes: nodesProp = (d: any) => d.nodes,
    nodeId = (d: any) => d.index,
    nodeAlign = sankeyJustify,
    nodeWidth = 4,
    nodePadding = 10,
    nodeSort,
    links: linksProp = (d: any) => d.links,
    linkSort,
    onUpdate,
    children,
  }: SankeyProps = $props();

  const ctx = getChartContext();

  const sankeyData = $derived.by(() => {
    if (typeof document === 'undefined') return { nodes: [], links: [] };

    return (
      d3Sankey()
        .size([ctx.width, ctx.height])
        .nodes(nodesProp)
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
        // @ts-expect-error
        .nodeSort(nodeSort)
        .links(linksProp)
        // @ts-expect-error
        .linkSort(linkSort)(structuredClone(ctx.data))
    );
  });

  $effect(() => {
    onUpdate?.(sankeyData);
  });

  $effect(() => {
    console.log(sankeyData.nodes[0].x0);
    console.log(sankeyData.nodes[0].y0);
  });
</script>

{@render children?.({
  nodes: sankeyData.nodes,
  links: sankeyData.links,
})}
