import type { HierarchyNode } from 'd3-hierarchy';

/**
 *  Find first ancestor matching filter, including node.
 *  Similar to `node.find()` (https://github.com/d3/d3-hierarchy#node_find) but checks ancestors instead of descendants
 */
export function findAncestor<T = any>(node: HierarchyNode<T>, filter: (node) => boolean) {
	while (node) {
		if (filter(node)) {
			return node;
		}
		node = node.parent;
	}

	return null;
}
