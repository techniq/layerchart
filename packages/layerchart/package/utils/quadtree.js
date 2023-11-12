/**
 * Transverse guadtree and generate rect dimensions
 */
export function quadtreeRects(quadtree, showLeaves = true) {
    const rects = [];
    quadtree.visit((node, x0, y0, x1, y1) => {
        if (showLeaves || Array.isArray(node)) {
            rects.push({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
        }
    });
    return rects;
}
