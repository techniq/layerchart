import { csvParseRows } from 'd3-dsv';
import type { SankeyGraph } from 'd3-sankey';
import type { hierarchy as d3Hierarchy } from 'd3-hierarchy';

/**
 * Convert CSV rows in format: 'source,target,value' to SankeyGraph
 */
export function graphFromCsv(csv: string): SankeyGraph<any, any> {
	const links = csvParseRows(csv, ([source, target, value /*, linkColor = color*/]) =>
		source && target
			? {
					source,
					target,
					// @ts-ignore
					value: !value || isNaN((value = +value)) ? 1 : value
					// color: linkColor,
			  }
			: null
	);

	const nodeByName = new Map();
	for (const link of links) {
		if (!nodeByName.has(link.source)) {
			nodeByName.set(link.source, { name: link.source });
		}
		if (!nodeByName.has(link.target)) {
			nodeByName.set(link.target, { name: link.target });
		}
	}
	return { nodes: Array.from(nodeByName.values()), links };
}

/**
 * Convert d3-hierarchy to graph (nodes/links)
 */
export function graphFromHierarchy(hierarchy: ReturnType<typeof d3Hierarchy>) {
	return {
		nodes: hierarchy.descendants(),
		links: hierarchy.links().map((link) => ({ ...link, value: link.target.value }))
	};
}
