import type { HierarchyNode, HierarchyRectangularNode } from 'd3-hierarchy';

type TileFunc = (
  node: HierarchyRectangularNode<any>,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) => void;

/**
 * This custom tiling function adapts the tiling function
 * for the appropriate aspect ratio when the treemap is zoomed-in.
 * see: https://observablehq.com/@d3/zoomable-treemap#tile and https://observablehq.com/@d3/stretched-treemap
 */
export function aspectTile(tile: TileFunc, width: number, height: number): TileFunc {
  return (node, x0, y0, x1, y1) => {
    tile(node, 0, 0, width, height);
    for (const child of node.children ?? []) {
      child.x0 = x0 + (child.x0 / width) * (x1 - x0);
      child.x1 = x0 + (child.x1 / width) * (x1 - x0);
      child.y0 = y0 + (child.y0 / height) * (y1 - y0);
      child.y1 = y0 + (child.y1 / height) * (y1 - y0);
    }
  };
}

/**
 * Show if the node (a) is a child of the selected (b), or any parent above selected
 */
export function isNodeVisible(a: HierarchyNode<any>, b: HierarchyNode<any> | null | undefined) {
  while (b) {
    if (a.parent === b) return true;
    b = b.parent;
  }

  return false;
}
