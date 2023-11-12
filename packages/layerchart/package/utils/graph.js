import { csvParseRows } from 'd3-dsv';
/**
 * Convert CSV rows in format: 'source,target,value' to SankeyGraph
 */
export function graphFromCsv(csv) {
    const links = csvParseRows(csv, ([source, target, value /*, linkColor = color*/]) => source && target
        ? {
            source,
            target,
            // @ts-ignore
            value: !value || isNaN((value = +value)) ? 1 : value
            // color: linkColor,
        }
        : null);
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
export function graphFromHierarchy(hierarchy) {
    return {
        nodes: hierarchy.descendants(),
        links: hierarchy.links().map((link) => ({ ...link, value: link.target.value }))
    };
}
/**
 * Create graph from node (and target node/links downward)
 */
export function graphFromNode(node) {
    const nodes = [node];
    const links = [];
    node.sourceLinks.forEach((link) => {
        nodes.push(link.target);
        links.push(link);
        if (link.target.sourceLinks.length) {
            const targetData = graphFromNode(link.target);
            // Only add new nodes
            targetData.nodes.forEach((node) => {
                if (!nodes.includes(node)) {
                    nodes.push(node);
                }
            });
            targetData.links.forEach((link) => {
                if (!links.includes(link)) {
                    links.push(link);
                }
            });
        }
    });
    return { nodes, links };
}
