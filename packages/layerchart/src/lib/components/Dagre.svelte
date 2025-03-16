<script lang="ts" module>
  export type DagreGraphData = {
    nodes: Array<{ id: string; parent?: string; label?: string | dagre.Label }>;
    edges: Array<{ source: string; target: string; label?: string }>;
  };

  export const RankDir = {
    'top-bottom': 'TB',
    'bottom-top': 'BT',
    'left-right': 'LR',
    'right-left': 'RL',
  };

  export const Align = {
    none: undefined,
    'up-left': 'UL',
    'up-right': 'UR',
    'down-left': 'DL',
    'down-right': 'DR',
  };

  export const EdgeLabelPosition = {
    left: 'l',
    center: 'c',
    right: 'r',
  };

  export type DagreProps = {
    /**
     * Data of nodes and edges to build graph
     */
    data: DagreGraphData;

    /**
     * Function to extract nodes from data
     * @default (d: any) => d.nodes
     */
    nodes?: (d: any) => any;

    /**
     * Function to extract node ID from node data
     * @default (d: any) => d.id
     */
    nodeId?: (d: any) => any;

    /**
     * Function to extract edges from data
     * @default (d: any) => d.edges
     */
    edges?: (d: any) => any;

    /**
     * Set graph as directed (true, default) or undirected (false),
     * which does not treat the order of nodes in an edge as significant
     * @default true
     */
    directed?: boolean;

    /**
     * Allow a graph to have multiple edges between the same pair of nodes
     * @default false
     */
    multigraph?: boolean;

    /**
     * Allow a graph to have compound nodes - nodes which can be the
     * `parent` of other nodes
     * @default false
     */
    compound?: boolean;

    /**
     * Type of algorithm to assigns a rank to each node in the input graph
     * @default 'network-simplex'
     */
    ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';

    /**
     * Direction for rank nodes
     * @default 'top-bottom'
     */
    direction?: keyof typeof RankDir;

    /**
     * Alignment for rank nodes
     * @default undefined
     */
    align?: keyof typeof Align | undefined;

    /**
     * Number of pixels between each rank in the layout
     * @default 50
     */
    rankSeparation?: number;

    /**
     * Number of pixels that separate nodes horizontally in the layout
     * @default 50
     */
    nodeSeparation?: number;

    /**
     * Number of pixels that separate edges horizontally in the layout
     * @default 10
     */
    edgeSeparation?: number;

    /**
     * Default node width if not defined on node
     * @default 100
     */
    nodeWidth?: number;

    /**
     * Default node height if not defined on node
     * @default 50
     */
    nodeHeight?: number;

    /**
     * Default link label width if not defined on edge
     * @default 100
     */
    edgeLabelWidth?: number;

    /**
     * Default edge label height if not defined on edge
     * @default 20
     */
    edgeLabelHeight?: number;

    /**
     * Default edge label position
     * @default 'center'
     */
    edgeLabelPosition?: keyof typeof EdgeLabelPosition;

    /**
     * Default pixels to move the label away from the edge if not defined on edge
     * Applies only when labelpos is l or r
     * @default 10
     */
    edgeLabelOffset?: number;

    /**
     * Filter nodes
     * @default () => true
     */
    filterNodes?: (nodeId: string, graph: dagre.graphlib.Graph) => boolean;

    /**
     * Exposed to access to Dagre Graph instance via `bind:graph`
     */
    graph?: dagre.graphlib.Graph;

    children?: Snippet<
      [{ nodes: Array<dagre.Node>; edges: Array<dagre.Edge>; graph: dagre.graphlib.Graph }]
    >;
  };
</script>

<script lang="ts">
  import dagre, { type Edge, type EdgeConfig, type GraphEdge } from '@dagrejs/dagre';
  import { untrack, type Snippet } from 'svelte';

  let {
    data,
    nodes = (d: any) => d.nodes,
    nodeId = (d: any) => d.id,
    edges = (d: any) => d.edges,
    directed = true,
    multigraph = false,
    compound = false,
    ranker = 'network-simplex',
    direction = 'top-bottom',
    align,
    rankSeparation = 50,
    nodeSeparation = 50,
    edgeSeparation = 10,
    nodeWidth = 100,
    nodeHeight = 50,
    edgeLabelWidth = 100,
    edgeLabelHeight = 20,
    edgeLabelPosition = 'center',
    edgeLabelOffset = 10,
    filterNodes = () => true,
    graph = $bindable(),
    children,
  }: DagreProps = $props();

  $effect(() => {
    let g = new dagre.graphlib.Graph({ directed, multigraph, compound });

    g.setGraph({
      ranker: ranker,
      rankdir: RankDir[direction],
      align: align ? Align[align] : undefined,
      ranksep: rankSeparation,
      nodesep: nodeSeparation,
      edgesep: edgeSeparation,
    });

    g.setDefaultEdgeLabel(() => {
      return {};
    });

    nodes(data).forEach((n: any) => {
      const id = nodeId(n);

      g.setNode(nodeId(n), {
        id,
        label: typeof n.label === 'string' ? n.label : id,
        width: nodeWidth,
        height: nodeHeight,
        ...(typeof n.label === 'object' ? n.label : null),
      });

      if (n.parent) {
        g.setParent(id, n.parent);
      }
    });

    edges(data).forEach((e: any) => {
      const { source, target, label, ...rest } = e;
      g.setEdge(
        e.source,
        e.target,
        label
          ? {
              label: label,
              labelpos: EdgeLabelPosition[edgeLabelPosition],
              labeloffset: edgeLabelOffset,
              width: edgeLabelWidth,
              height: edgeLabelHeight,
              ...rest,
            }
          : {}
      );
    });
    const _graph = untrack(() => graph!);

    g = filterNodes ? g.filterNodes((nodeId) => filterNodes(nodeId, _graph)) : _graph;

    dagre.layout(g);

    graph = g;
  });

  const graphNodes = $derived(graph!.nodes().map((id) => graph!.node(id)));
  const graphEdges = $derived(
    graph!.edges().map((edge) => ({ ...edge, ...graph!.edge(edge) })) as Array<
      Edge & EdgeConfig & GraphEdge // `EdgeConfig` is excluded when inferred from usage
    >
  );
</script>

<!-- TODO: are we sure we want to force these types? -->
{@render children?.({ nodes: graphNodes, edges: graphEdges, graph: graph! })}
