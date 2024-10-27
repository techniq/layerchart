<script module>
  export type DagreGraphData = {
    nodes: Array<{ id: string; label?: string | dagre.Label }>;
    edges: Array<{ source: string; target: string }>;
  };

  export const RankDir = {
    'top-bottom': 'TB',
    'bottom-top': 'BT',
    'left-right': 'LR',
    'right-left': 'RL',
  };

  export const Align = {
    'up-left': 'UL',
    'up-right': 'UR',
    'down-left': 'DL',
    'down-right': 'DR',
  };
</script>

<script lang="ts">
  import dagre from '@dagrejs/dagre';

  /** Data of nodes and edges to build graph */
  export let data: DagreGraphData;

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

  /** Default node width if not defined */
  export let nodeWidth = 100;

  /** Default node height if not defined */
  export let nodeHeight = 50;

  /** Filter nodes */
  export let filterNodes: (nodeId: string, graph: dagre.graphlib.Graph) => boolean = () => true;

  let graph: dagre.graphlib.Graph;
  $: {
    let graph = new dagre.graphlib.Graph();

    graph.setGraph({
      ranker: ranker,
      rankdir: RankDir[direction],
      align: align ? Align[align] : undefined,
      ranksep: rankSeparation,
      nodesep: nodeSeparation,
      edgesep: edgeSeparation,
    });

    graph.setDefaultEdgeLabel(() => {
      return {};
    });

    data.nodes.forEach((n) => {
      graph.setNode(n.id, {
        id: n.id,
        label: typeof n.label === 'string' ? n.label : n.id,
        width: nodeWidth,
        height: nodeHeight,
        ...(typeof n.label === 'object' ? n.label : null),
      });
    });

    data.edges.forEach((e) => {
      g.setEdge(e.source, e.target);
    });

    graph = filterNodes ? graph.filterNodes((nodeId) => filterNodes(nodeId, graph)) : graph;

    dagre.layout(graph);
  }

  $: nodes = graph.nodes().map((id) => g.node(id));
  $: edges = graph.edges().map((edge) => ({ ...edge, ...graph.edge(edge) }));
</script>

<slot {nodes} {edges} />
