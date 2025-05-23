import { csvParseRows } from 'd3-dsv';
import type {
  SankeyExtraProperties,
  SankeyGraph,
  SankeyLink,
  SankeyNode,
  SankeyNodeMinimal,
} from 'd3-sankey';
import type { hierarchy as d3Hierarchy } from 'd3-hierarchy';

/**
 * Convert CSV rows in format: 'source,target,value' to SankeyGraph
 */
export function sankeyGraphFromCsv(csv: string): SankeyGraph<any, any> {
  const links = csvParseRows(csv, ([source, target, value /*, linkColor = color*/]) =>
    source && target
      ? {
          source,
          target,
          // @ts-expect-error
          value: !value || isNaN((value = +value)) ? 1 : +value,
          // color: linkColor,
        }
      : null
  );

  return { nodes: sankeyNodesFromLinks(links), links };
}

/**
 * Convert d3-hierarchy to graph (nodes/links)
 */
export function sankeyGraphFromHierarchy(hierarchy: ReturnType<typeof d3Hierarchy>) {
  return {
    nodes: hierarchy.descendants(),
    links: hierarchy.links().map((link) => ({ ...link, value: link.target.value })),
  };
}

/**
 * Create graph from node (and target node/links downward)
 */
export function sankeyGraphFromNode(node: SankeyNodeMinimal<any, any>) {
  const nodes: SankeyNode<any, any>[] = [node];
  const links: SankeyLink<any, any>[] = [];

  for (const link of node.sourceLinks ?? []) {
    nodes.push(link.target);
    links.push(link);

    if (link.target.sourceLinks.length) {
      const targetData = sankeyGraphFromNode(link.target);

      // Only add new nodes
      for (const node of targetData.nodes) {
        if (!nodes.includes(node)) {
          nodes.push(node);
        }
      }
      // Only add new links
      for (const link of targetData.links) {
        if (!links.includes(link)) {
          links.push(link);
        }
      }
    }
  }

  return { nodes, links };
}

/**
 * Get distinct nodes from link.source and link.target
 */
export function sankeyNodesFromLinks<
  N extends SankeyExtraProperties,
  L extends SankeyExtraProperties,
>(links: Array<SankeyLink<N, L>>) {
  const nodesByName = new Map();
  for (const link of links) {
    if (!nodesByName.has(link.source)) {
      nodesByName.set(link.source, { name: link.source });
    }
    if (!nodesByName.has(link.target)) {
      nodesByName.set(link.target, { name: link.target });
    }
  }
  return Array.from(nodesByName.values());
}
