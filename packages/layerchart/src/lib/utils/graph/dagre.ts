import dagre from '@dagrejs/dagre';

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
