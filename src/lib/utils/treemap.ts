/**
 * This custom tiling function adapts the built-in binary tiling function
 * for the appropriate aspect ratio when the treemap is zoomed-in.
 * see: https://observablehq.com/@d3/zoomable-treemap#tile and https://observablehq.com/@d3/stretched-treemap
 */
export function aspectTile(tile, width, height) {
	return (node, x0, y0, x1, y1) => {
		tile(node, 0, 0, width, height);
		for (const child of node.children) {
			child.x0 = x0 + (child.x0 / width) * (x1 - x0);
			child.x1 = x0 + (child.x1 / width) * (x1 - x0);
			child.y0 = y0 + (child.y0 / height) * (y1 - y0);
			child.y1 = y0 + (child.y1 / height) * (y1 - y0);
		}
	};
}
