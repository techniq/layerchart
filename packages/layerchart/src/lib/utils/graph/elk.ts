import * as ElkLib from 'elkjs/lib/elk.bundled.js';
import type {
  ELK as ElkInstance,
  ElkNode,
  ElkExtendedEdge,
  ElkPoint,
  LayoutOptions,
  ELKConstructorArguments,
} from 'elkjs/lib/elk.bundled.js';

// elkjs exposes its constructor as a CJS default; with NodeNext typings
// the default may live under `.default` or be the module itself.
const ElkConstructor = (ElkLib as unknown as {
  default?: { new (args?: ELKConstructorArguments): ElkInstance };
}).default ?? (ElkLib as unknown as { new (args?: ELKConstructorArguments): ElkInstance });

import {
  Algorithm,
  Direction,
  EdgeRouting,
  HierarchyHandling,
  NodePlacementStrategy,
  type ElkProps,
} from '$lib/components/graph/Elk.svelte';

/** Lazy ELK instance (created on first use, must run client-side) */
let _elk: ElkInstance | undefined;
function getElk(): ElkInstance {
  if (!_elk) {
    _elk = new ElkConstructor();
  }
  return _elk;
}

export type ElkInputNode = {
  id: string;
  parent?: string;
  label?: string;
  width?: number;
  height?: number;
  layoutOptions?: LayoutOptions;
};

export type ElkInputEdge = {
  id?: string;
  source: string;
  target: string;
  label?: string;
};

export type ElkInputData = {
  nodes: ElkInputNode[];
  edges: ElkInputEdge[];
};

/** Flat node returned from layout (absolute coordinates, x/y are center) */
export type ElkLayoutNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parent?: string;
  /** True when this node has children (i.e. is a compound/cluster container) */
  isCompound: boolean;
  /** absolute top-left x */
  x0: number;
  /** absolute top-left y */
  y0: number;
  /** raw ELK node */
  raw: ElkNode;
};

/** Flat edge returned from layout */
export type ElkLayoutEdge = {
  id: string;
  /** source node id (matches `v` from Dagre for compatibility) */
  v: string;
  /** target node id (matches `w` from Dagre for compatibility) */
  w: string;
  source: string;
  target: string;
  label?: string;
  /** Polyline points (absolute) — start, bend points, end. Empty if elk did not produce sections. */
  points: Array<ElkPoint>;
  /** Optional label center (absolute) */
  x?: number;
  y?: number;
  /** raw ELK edge */
  raw: ElkExtendedEdge;
};

export type ElkLayoutResult = {
  nodes: ElkLayoutNode[];
  edges: ElkLayoutEdge[];
  /** Raw root ELK graph after layout */
  graph: ElkNode;
};

/**
 * Build the ELK input graph from a flat `{ nodes, edges }` representation.
 * Nodes with a `parent` reference are nested under their parent (compound layout).
 */
export function buildElkInput(
  data: ElkInputData,
  {
    nodes = (d: any) => d.nodes,
    nodeId = (d: any) => d.id,
    edges = (d: any) => d.edges,
    nodeWidth = 100,
    nodeHeight = 50,
    layoutOptions = {},
  }: {
    nodes?: ElkProps['nodes'];
    nodeId?: ElkProps['nodeId'];
    edges?: ElkProps['edges'];
    nodeWidth?: number;
    nodeHeight?: number;
    layoutOptions?: LayoutOptions;
  }
): ElkNode {
  const dataNodes: ElkInputNode[] = nodes(data) ?? [];
  const dataEdges: ElkInputEdge[] = edges(data) ?? [];

  const elkNodes = new Map<string, ElkNode>();
  for (const n of dataNodes) {
    const id = nodeId(n);
    const label = typeof n.label === 'string' ? n.label : id;
    elkNodes.set(id, {
      id,
      width: n.width ?? nodeWidth,
      height: n.height ?? nodeHeight,
      labels: [{ text: label }],
      layoutOptions: n.layoutOptions,
      children: [],
      edges: [],
    });
  }

  const root: ElkNode = {
    id: 'root',
    layoutOptions,
    children: [],
    edges: [],
  };

  // Nest nodes under their parent (or root)
  for (const n of dataNodes) {
    const id = nodeId(n);
    const elkNode = elkNodes.get(id)!;
    const parent = n.parent && elkNodes.has(n.parent) ? elkNodes.get(n.parent)! : root;
    parent.children!.push(elkNode);
  }

  // We deliberately do NOT auto-add padding or label-placement options on compound
  // nodes — those interfere with ELK's edge routing for sibling/internal edges.
  // Users render compound labels in their own snippet (typically above the box,
  // using the `isCompound` flag we expose on each node).

  // Build a parent-id lookup so we can find the lowest common ancestor of an edge's
  // source and target nodes. ELK requires each edge to live on its LCA when using
  // `hierarchyHandling=INCLUDE_CHILDREN`; placing them all at the root produces
  // garbage coordinates for sibling edges inside a compound.
  const parentOf = new Map<string, string | undefined>();
  for (const n of dataNodes) {
    parentOf.set(nodeId(n), n.parent);
  }
  function ancestors(id: string): string[] {
    const chain: string[] = [];
    let cur: string | undefined = id;
    while (cur) {
      chain.push(cur);
      cur = parentOf.get(cur);
    }
    return chain;
  }
  function lcaContainer(source: string, target: string): ElkNode {
    const aChain = ancestors(source);
    const bSet = new Set(ancestors(target));
    // Skip the source itself; its enclosing parent is the first candidate.
    for (let i = 1; i < aChain.length; i++) {
      if (bSet.has(aChain[i])) {
        const node = elkNodes.get(aChain[i]);
        if (node) return node;
      }
    }
    return root;
  }

  let edgeIdx = 0;
  for (const e of dataEdges) {
    const id = e.id ?? `e${edgeIdx++}`;
    const edge: ElkExtendedEdge = {
      id,
      sources: [e.source],
      targets: [e.target],
    };
    if (e.label) {
      edge.labels = [{ text: e.label, width: 60, height: 16 }];
    }
    const container = lcaContainer(e.source, e.target);
    container.edges!.push(edge);
  }

  return root;
}

/**
 * Algorithms that only place nodes — they either return no edge `sections` or
 * return sections whose endpoints don't actually connect source to target.
 * For these we synthesize straight center-to-center polylines instead of
 * trusting ELK's edge output.
 */
const NODE_ONLY_ALGORITHMS = new Set([
  'org.eclipse.elk.random',
  'org.eclipse.elk.box',
  'org.eclipse.elk.rectpacking',
  'org.eclipse.elk.fixed',
  'org.eclipse.elk.sporeOverlap',
  'org.eclipse.elk.sporeCompaction',
]);

/**
 * Flatten ELK's hierarchical output into absolute-coordinate nodes/edges.
 */
export function processElkLayout(graph: ElkNode): ElkLayoutResult {
  const nodes: ElkLayoutNode[] = [];
  const edges: ElkLayoutEdge[] = [];

  const algorithm = graph.layoutOptions?.['elk.algorithm'];
  const skipSections = algorithm ? NODE_ONLY_ALGORITHMS.has(algorithm) : false;

  function walkNodes(node: ElkNode, parentX: number, parentY: number, parentId?: string) {
    for (const child of node.children ?? []) {
      const x0 = parentX + (child.x ?? 0);
      const y0 = parentY + (child.y ?? 0);
      const width = child.width ?? 0;
      const height = child.height ?? 0;
      const label = child.labels?.[0]?.text ?? child.id;

      nodes.push({
        id: child.id,
        label,
        x: x0 + width / 2,
        y: y0 + height / 2,
        width,
        height,
        x0,
        y0,
        parent: parentId,
        isCompound: (child.children?.length ?? 0) > 0,
        raw: child,
      });

      walkNodes(child, x0, y0, child.id);
    }
  }

  function walkEdges(node: ElkNode, parentX: number, parentY: number) {
    for (const edge of (node.edges ?? []) as ElkExtendedEdge[]) {
      const points: ElkPoint[] = [];
      const sections = skipSections ? [] : edge.sections ?? [];
      for (const section of sections) {
        if (points.length === 0) {
          points.push({
            x: parentX + section.startPoint.x,
            y: parentY + section.startPoint.y,
          });
        }
        for (const p of section.bendPoints ?? []) {
          points.push({ x: parentX + p.x, y: parentY + p.y });
        }
        points.push({
          x: parentX + section.endPoint.x,
          y: parentY + section.endPoint.y,
        });
      }

      const labelShape = edge.labels?.[0];
      const labelX =
        labelShape?.x != null
          ? parentX + labelShape.x + (labelShape.width ?? 0) / 2
          : undefined;
      const labelY =
        labelShape?.y != null
          ? parentY + labelShape.y + (labelShape.height ?? 0) / 2
          : undefined;

      edges.push({
        id: edge.id,
        v: edge.sources[0],
        w: edge.targets[0],
        source: edge.sources[0],
        target: edge.targets[0],
        label: labelShape?.text,
        points,
        x: labelX,
        y: labelY,
        raw: edge,
      });
    }
    for (const child of node.children ?? []) {
      walkEdges(child, parentX + (child.x ?? 0), parentY + (child.y ?? 0));
    }
  }

  walkNodes(graph, 0, 0, undefined);
  walkEdges(graph, 0, 0);

  // For node-only algorithms (and any other case where ELK didn't return
  // section data) synthesize a straight line between source and target centers.
  let nodesById: Map<string, ElkLayoutNode> | undefined;
  for (const edge of edges) {
    if (edge.points.length > 0) continue;
    nodesById ??= new Map(nodes.map((n) => [n.id, n]));
    const source = nodesById.get(edge.source);
    const target = nodesById.get(edge.target);
    if (source && target) {
      edge.points = [
        { x: source.x, y: source.y },
        { x: target.x, y: target.y },
      ];
    }
  }

  return { nodes, edges, graph };
}

/**
 * Resolve all `ElkProps` knobs into an ELK `layoutOptions` object.
 */
export function elkLayoutOptions({
  algorithm = 'layered',
  direction = 'right',
  edgeRouting,
  hierarchyHandling,
  nodePlacementStrategy,
  nodeNodeSpacing,
  edgeEdgeSpacing,
  edgeNodeSpacing,
  layerSpacing,
  componentSpacing,
  aspectRatio,
  separateConnectedComponents,
  padding,
  layoutOptions = {},
}: {
  algorithm?: ElkProps['algorithm'];
  direction?: ElkProps['direction'];
  edgeRouting?: ElkProps['edgeRouting'];
  hierarchyHandling?: ElkProps['hierarchyHandling'];
  nodePlacementStrategy?: ElkProps['nodePlacementStrategy'];
  nodeNodeSpacing?: number;
  edgeEdgeSpacing?: number;
  edgeNodeSpacing?: number;
  layerSpacing?: number;
  componentSpacing?: number;
  aspectRatio?: number;
  separateConnectedComponents?: boolean;
  padding?: number | string;
  layoutOptions?: LayoutOptions;
} = {}): LayoutOptions {
  const opts: LayoutOptions = {
    'elk.algorithm': Algorithm[algorithm ?? 'layered'] ?? Algorithm.layered,
    'elk.direction': Direction[direction ?? 'right'] ?? Direction.right,
  };

  if (edgeRouting) {
    opts['elk.edgeRouting'] = EdgeRouting[edgeRouting];
  }
  if (hierarchyHandling) {
    opts['elk.hierarchyHandling'] = HierarchyHandling[hierarchyHandling];
  }
  if (nodePlacementStrategy) {
    opts['elk.layered.nodePlacement.strategy'] = NodePlacementStrategy[nodePlacementStrategy];
  }
  if (nodeNodeSpacing != null) {
    opts['elk.spacing.nodeNode'] = String(nodeNodeSpacing);
  }
  if (edgeEdgeSpacing != null) {
    opts['elk.spacing.edgeEdge'] = String(edgeEdgeSpacing);
  }
  if (edgeNodeSpacing != null) {
    opts['elk.spacing.edgeNode'] = String(edgeNodeSpacing);
  }
  if (layerSpacing != null) {
    opts['elk.layered.spacing.nodeNodeBetweenLayers'] = String(layerSpacing);
  }
  if (componentSpacing != null) {
    opts['elk.spacing.componentComponent'] = String(componentSpacing);
  }
  if (aspectRatio != null) {
    opts['elk.aspectRatio'] = String(aspectRatio);
  }
  if (separateConnectedComponents != null) {
    opts['elk.separateConnectedComponents'] = String(separateConnectedComponents);
  }
  if (padding != null) {
    opts['elk.padding'] =
      typeof padding === 'number' ? `[top=${padding},left=${padding},bottom=${padding},right=${padding}]` : padding;
  }

  return { ...opts, ...layoutOptions };
}

/**
 * Run ELK layout on the given data and return flattened nodes/edges.
 */
export async function elkLayout(
  data: ElkInputData,
  props: {
    nodes?: ElkProps['nodes'];
    nodeId?: ElkProps['nodeId'];
    edges?: ElkProps['edges'];
    nodeWidth?: number;
    nodeHeight?: number;
  } & Parameters<typeof elkLayoutOptions>[0] = {}
): Promise<ElkLayoutResult> {
  const { nodes, nodeId, edges, nodeWidth, nodeHeight, ...optsArgs } = props;
  const layoutOptions = elkLayoutOptions(optsArgs);
  const input = buildElkInput(data, {
    nodes,
    nodeId,
    edges,
    nodeWidth,
    nodeHeight,
    layoutOptions,
  });
  const elk = getElk();
  const result = await elk.layout(input);
  return processElkLayout(result);
}

/** Get all upstream predecessor ids for a node */
export function elkAncestors(
  edges: ElkLayoutEdge[],
  nodeId: string,
  maxDepth = Infinity,
  currentDepth = 0
): string[] {
  if (currentDepth === maxDepth) return [];
  const predecessors = edges.filter((e) => e.w === nodeId).map((e) => e.v);
  return [
    ...predecessors,
    ...predecessors.flatMap((id) => elkAncestors(edges, id, maxDepth, currentDepth + 1)),
  ];
}

/** Get all downstream descendant ids for a node */
export function elkDescendants(
  edges: ElkLayoutEdge[],
  nodeId: string,
  maxDepth = Infinity,
  currentDepth = 0
): string[] {
  if (currentDepth === maxDepth) return [];
  const successors = edges.filter((e) => e.v === nodeId).map((e) => e.w);
  return [
    ...successors,
    ...successors.flatMap((id) => elkDescendants(edges, id, maxDepth, currentDepth + 1)),
  ];
}
