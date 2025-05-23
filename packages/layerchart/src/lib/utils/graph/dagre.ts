import dagre from '@dagrejs/dagre';
import { Align, EdgeLabelPosition, RankDir, type DagreProps } from '$lib/components/Dagre.svelte';

/**
 * Build `dagre.graphlib.Graph` instance from DagreGraphData (`{ nodes, edges }`)
 */
export function dagreGraph(
  data: DagreProps['data'],
  {
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
  }: {
    nodes?: DagreProps['nodes'];
    nodeId?: DagreProps['nodeId'];
    edges?: DagreProps['edges'];
    directed?: DagreProps['directed'];
    multigraph?: DagreProps['multigraph'];
    compound?: DagreProps['compound'];
    ranker?: DagreProps['ranker'];
    direction?: DagreProps['direction'];
    align?: DagreProps['align'];
    rankSeparation?: DagreProps['rankSeparation'];
    nodeSeparation?: DagreProps['nodeSeparation'];
    edgeSeparation?: DagreProps['edgeSeparation'];
    nodeWidth?: DagreProps['nodeWidth'];
    nodeHeight?: DagreProps['nodeHeight'];
    edgeLabelWidth?: DagreProps['edgeLabelWidth'];
    edgeLabelHeight?: DagreProps['edgeLabelHeight'];
    edgeLabelPosition?: DagreProps['edgeLabelPosition'];
    edgeLabelOffset?: DagreProps['edgeLabelOffset'];
    filterNodes?: DagreProps['filterNodes'];
  } = {}
) {
  let g = new dagre.graphlib.Graph({ directed, multigraph, compound });

  g.setGraph({
    ranker: ranker,
    rankdir: RankDir[direction],
    align: align ? Align[align] : undefined,
    ranksep: rankSeparation,
    nodesep: nodeSeparation,
    edgesep: edgeSeparation,
  });

  g.setDefaultEdgeLabel(() => ({}));

  const dataNodes = nodes(data);

  for (const n of dataNodes) {
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
  }

  const nodeEdges = edges(data);

  for (const e of nodeEdges) {
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
  }

  if (filterNodes) {
    g = g.filterNodes((nodeId) => filterNodes(nodeId, g));
  }

  dagre.layout(g);

  return g;
}

/**
 * Get all upstream predecessors for dagre nodeId
 */
export function dagreAncestors(
  graph: dagre.graphlib.Graph,
  nodeId: string,
  maxDepth = Infinity,
  currentDepth = 0
): dagre.Node[] {
  if (currentDepth === maxDepth) {
    return [];
  }

  const predecessors = graph.predecessors(nodeId) ?? [];
  return [
    ...predecessors,
    // @ts-expect-error: Types from dagre appear incorrect
    ...predecessors.flatMap((pId) => dagreAncestors(graph, pId, maxDepth, currentDepth + 1)),
  ];
}

/**
 * Get all downstream descendants for dagre nodeId
 */
export function dagreDescendants(
  graph: dagre.graphlib.Graph,
  nodeId: string,
  maxDepth = Infinity,
  currentDepth = 0
): dagre.Node[] {
  if (currentDepth === maxDepth) {
    return [];
  }

  const predecessors = graph.successors(nodeId) ?? [];
  return [
    ...predecessors,
    // @ts-expect-error: Types from dagre appear incorrect
    ...predecessors.flatMap((pId) => dagreDescendants(graph, pId, maxDepth, currentDepth + 1)),
  ];
}
