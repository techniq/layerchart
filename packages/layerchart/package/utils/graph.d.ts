import type { SankeyGraph, SankeyNodeMinimal } from 'd3-sankey';
import type { hierarchy as d3Hierarchy } from 'd3-hierarchy';
/**
 * Convert CSV rows in format: 'source,target,value' to SankeyGraph
 */
export declare function graphFromCsv(csv: string): SankeyGraph<any, any>;
/**
 * Convert d3-hierarchy to graph (nodes/links)
 */
export declare function graphFromHierarchy(hierarchy: ReturnType<typeof d3Hierarchy>): {
    nodes: import("d3-hierarchy").HierarchyNode<unknown>[];
    links: {
        value: number | undefined;
        source: import("d3-hierarchy").HierarchyNode<unknown>;
        target: import("d3-hierarchy").HierarchyNode<unknown>;
    }[];
};
/**
 * Create graph from node (and target node/links downward)
 */
export declare function graphFromNode(node: SankeyNodeMinimal<any, any>): {
    nodes: SankeyNodeMinimal<any, any>[];
    links: any[];
};
