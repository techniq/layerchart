import type { HierarchyNode } from 'd3-hierarchy';
/**
 *  Find first ancestor matching filter, including node.
 *  Similar to `node.find()` (https://github.com/d3/d3-hierarchy#node_find) but checks ancestors instead of descendants
 */
export declare function findAncestor<T = any>(node: HierarchyNode<T>, filter: (node: any) => boolean): HierarchyNode<T> | null;
