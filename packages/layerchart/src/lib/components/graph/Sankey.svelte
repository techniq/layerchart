<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SankeyGraph, SankeyLink, SankeyNode } from '$lib/utils/graph/sankeyLayout.js';

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
     * Which column each node goes in: `left` by depth from the sources, `right` by height from the
     * sinks, `center` next to the nodes it links to, and `justify` like `left` but with sinks in the
     * last column
     *
     * @default 'justify'
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
          links: SankeyLink<NodeExtraProperties, any>[];
        },
      ]
    >;
  };
</script>

<script lang="ts">
  import {
    sankeyLayout,
    sankeyLeft,
    sankeyCenter,
    sankeyRight,
    sankeyJustify,
    type SankeyLayoutOptions,
  } from '$lib/utils/graph/sankeyLayout.js';

  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    nodes: nodesProp = (d: any) => d.nodes,
    nodeId = (d: any) => d.index,
    nodeAlign = 'justify',
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
    const data = structuredClone(ctx.data);
    return sankeyLayout(
      { nodes: nodesProp(data), links: linksProp(data) },
      {
        size: [ctx.width, ctx.height],
        nodeId,
        nodeAlign:
          nodeAlign === 'left'
            ? sankeyLeft
            : nodeAlign === 'center'
              ? sankeyCenter
              : nodeAlign === 'right'
                ? sankeyRight
                : nodeAlign === 'justify'
                  ? sankeyJustify
                  : nodeAlign,
        nodeWidth,
        nodePadding,
        nodeSort: nodeSort as SankeyLayoutOptions['nodeSort'],
        linkSort: linkSort as SankeyLayoutOptions['linkSort'],
      }
    );
  });

  $effect(() => {
    onUpdate?.(sankeyData);
  });
</script>

{@render children?.({
  nodes: sankeyData.nodes,
  links: sankeyData.links,
})}
