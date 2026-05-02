<script lang="ts" module>
  import { type Snippet } from 'svelte';
  import type { LayoutOptions, ElkNode } from 'elkjs/lib/elk.bundled.js';

  import type {
    ElkInputData,
    ElkLayoutNode,
    ElkLayoutEdge,
    ElkLayoutResult,
  } from '$lib/utils/graph/elk.js';

  /**
   * ELK layout algorithm identifiers.
   * @see https://eclipse.dev/elk/reference/algorithms.html
   */
  export const Algorithm = {
    layered: 'org.eclipse.elk.layered',
    mrtree: 'org.eclipse.elk.mrtree',
    force: 'org.eclipse.elk.force',
    stress: 'org.eclipse.elk.stress',
    radial: 'org.eclipse.elk.radial',
    disco: 'org.eclipse.elk.disco',
    rectpacking: 'org.eclipse.elk.rectpacking',
    box: 'org.eclipse.elk.box',
    fixed: 'org.eclipse.elk.fixed',
    random: 'org.eclipse.elk.random',
    sporeOverlap: 'org.eclipse.elk.sporeOverlap',
    sporeCompaction: 'org.eclipse.elk.sporeCompaction',
  } as const;

  export const Direction = {
    'top-bottom': 'DOWN',
    'bottom-top': 'UP',
    'left-right': 'RIGHT',
    'right-left': 'LEFT',
    down: 'DOWN',
    up: 'UP',
    right: 'RIGHT',
    left: 'LEFT',
    undefined: 'UNDEFINED',
  } as const;

  export const EdgeRouting = {
    polyline: 'POLYLINE',
    orthogonal: 'ORTHOGONAL',
    splines: 'SPLINES',
    undefined: 'UNDEFINED',
  } as const;

  export const HierarchyHandling = {
    'include-children': 'INCLUDE_CHILDREN',
    'separate-children': 'SEPARATE_CHILDREN',
    inherit: 'INHERIT',
  } as const;

  /**
   * Strategies controlling node placement within layers (layered algorithm only).
   * @see https://eclipse.dev/elk/reference/options/org-eclipse-elk-layered-nodePlacement-strategy.html
   */
  export const NodePlacementStrategy = {
    simple: 'SIMPLE',
    'interactive': 'INTERACTIVE',
    'linear-segments': 'LINEAR_SEGMENTS',
    'brandes-koepf': 'BRANDES_KOEPF',
    'network-simplex': 'NETWORK_SIMPLEX',
  } as const;

  export type ElkProps = {
    /** Data of nodes and edges to build graph */
    data: ElkInputData;

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
     * Layout algorithm
     * @default 'layered'
     */
    algorithm?: keyof typeof Algorithm;

    /**
     * Layout direction (mainly relevant for layered/mrtree)
     * @default 'right'
     */
    direction?: keyof typeof Direction;

    /**
     * Edge routing style
     * @default undefined (algorithm default)
     */
    edgeRouting?: keyof typeof EdgeRouting;

    /**
     * Hierarchy handling for compound graphs
     * @default undefined
     */
    hierarchyHandling?: keyof typeof HierarchyHandling;

    /**
     * Node placement strategy (layered algorithm)
     * @default undefined
     */
    nodePlacementStrategy?: keyof typeof NodePlacementStrategy;

    /** Spacing between two adjacent nodes (default 20) */
    nodeNodeSpacing?: number;

    /** Spacing between two adjacent edges */
    edgeEdgeSpacing?: number;

    /** Spacing between a node and an adjacent edge */
    edgeNodeSpacing?: number;

    /** Spacing between adjacent layers (layered algorithm) */
    layerSpacing?: number;

    /** Spacing between disconnected components */
    componentSpacing?: number;

    /** Aspect ratio for layouts that support it */
    aspectRatio?: number;

    /** Whether to layout disconnected components separately */
    separateConnectedComponents?: boolean;

    /** Padding around the graph (number applied to all sides, or ELK string format) */
    padding?: number | string;

    /** Default node width if not defined on node @default 100 */
    nodeWidth?: number;

    /** Default node height if not defined on node @default 50 */
    nodeHeight?: number;

    /**
     * Additional raw ELK layout options. Merged on top of the typed props above so
     * any option not surfaced here can still be configured.
     * @see https://eclipse.dev/elk/reference/options.html
     */
    layoutOptions?: LayoutOptions;

    /** Exposed to access the raw ELK graph result via `bind:graph` */
    graph?: ElkNode | null;

    /** Exposed to indicate layout is in-flight via `bind:loading` */
    loading?: boolean;

    children?: Snippet<
      [
        {
          nodes: ElkLayoutNode[];
          edges: ElkLayoutEdge[];
          graph: ElkNode | null;
          loading: boolean;
        },
      ]
    >;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { elkLayout } from '$lib/utils/graph/elk.js';

  const ctx = getChartContext();
  ctx.registerComponent({ name: 'Elk', kind: 'composite-mark' });

  let {
    data,
    nodes = (d: any) => d.nodes,
    nodeId = (d: any) => d.id,
    edges = (d: any) => d.edges,
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
    nodeWidth = 100,
    nodeHeight = 50,
    layoutOptions,
    graph: graphProp = $bindable(null),
    loading: loadingProp = $bindable(false),
    children,
  }: ElkProps = $props();

  let result = $state<ElkLayoutResult | null>(null);
  let loading = $state(false);

  // Re-run layout whenever any input changes
  $effect(() => {
    // Track all inputs (`data`, knobs, etc.)
    const inputs = {
      data,
      nodes,
      nodeId,
      edges,
      algorithm,
      direction,
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
      nodeWidth,
      nodeHeight,
      layoutOptions,
    };

    if (typeof document === 'undefined' || !data) return;

    let cancelled = false;
    untrack(() => {
      loading = true;
      loadingProp = true;
    });

    elkLayout(data, inputs)
      .then((r) => {
        if (cancelled) return;
        result = r;
        graphProp = r.graph;
        loading = false;
        loadingProp = false;
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Elk] layout failed:', err);
        loading = false;
        loadingProp = false;
      });

    return () => {
      cancelled = true;
    };
  });

  const graphNodes = $derived(result?.nodes ?? []);
  const graphEdges = $derived(result?.edges ?? []);
  const graph = $derived(result?.graph ?? null);
</script>

{@render children?.({ nodes: graphNodes, edges: graphEdges, graph, loading })}
