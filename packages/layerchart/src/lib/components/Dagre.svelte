<script lang="ts" context="module">
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
</script>

<script lang="ts">
  import dagre, { type Edge, type EdgeConfig, type GraphEdge } from '@dagrejs/dagre';

  /** Data of nodes and edges to build graph */
  export let data: DagreGraphData;

  export let nodes = (d: any) => d.nodes;
  export let nodeId = (d: any) => d.id;
  export let edges = (d: any) => d.edges;

  /** Set graph as directed (true, default) or undirected (false), which does not treat the order of nodes in an edge as significant. */
  export let directed = true;

  /** Allow a graph to have multiple edges between the same pair of nodes */
  export let multigraph = false;

  /** Allow a graph to have compound nodes - nodes which can be the `parent` of other nodes */
  export let compound = false;

  /** Type of algorithm to assigns a rank to each node in the input graph */
  export let ranker: 'network-simplex' | 'tight-tree' | 'longest-path' = 'network-simplex';

  /** Direction for rank nodes */
  export let direction: keyof typeof RankDir = 'top-bottom';

  /** Alignment for rank nodes */
  export let align: keyof typeof Align | undefined = undefined;

  /** Number of pixels between each rank in the layout */
  export let rankSeparation = 50;

  /** Number of pixels that separate nodes horizontally in the layout */
  export let nodeSeparation = 50;

  /** Number of pixels that separate edges horizontally in the layout */
  export let edgeSeparation = 10;

  /** Default node width if not defined on node */
  export let nodeWidth = 100;

  /** Default node height if not defined on node */
  export let nodeHeight = 50;

  /** Default link label width if not defined on edge */
  export let edgeLabelWidth = 100;

  /** Default edge label height if not defined on edge */
  export let edgeLabelHeight = 20;

  /** Default edge label height if not defined on edge */
  export let edgeLabelPosition: keyof typeof EdgeLabelPosition = 'center';

  /** Default pixels to move the label away from the edge if not defined on edge. Applies only when labelpos is l or r.*/
  export let edgeLabelOffset = 10;

  /** Filter nodes */
  export let filterNodes: (nodeId: string, graph: dagre.graphlib.Graph) => boolean = () => true;

  /** Exposed to access to Dagre Graph instance via `bind:graph` */
  export let graph: dagre.graphlib.Graph | undefined = undefined;
  $: {
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

    g = filterNodes ? g.filterNodes((nodeId) => filterNodes(nodeId, graph)) : graph;

    dagre.layout(g);

    graph = g;
  }

  $: graphNodes = graph.nodes().map((id) => graph.node(id));
  $: graphEdges = graph.edges().map((edge) => ({ ...edge, ...graph.edge(edge) })) as Array<
    Edge & EdgeConfig & GraphEdge // `EdgeConfig` is excluded when inferred from usage
  >;
</script>

<slot nodes={graphNodes} edges={graphEdges} {graph} />
