/**
 * This custom tiling function adapts the tiling function
 * for the appropriate aspect ratio when the treemap is zoomed-in.
 * see: https://observablehq.com/@d3/zoomable-treemap#tile and https://observablehq.com/@d3/stretched-treemap
 */
export declare function aspectTile(tile: any, width: any, height: any): (node: any, x0: any, y0: any, x1: any, y1: any) => void;
/**
 * Show if the node (a) is a child of the selected (b), or any parent above selected
 */
export declare function isNodeVisible(a: any, b: any): boolean;
