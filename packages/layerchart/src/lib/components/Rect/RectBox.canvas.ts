import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
import { polygonPath, type BoxFace } from '$lib/utils/isometric.js';

/**
 * A `Rect` stood up into a box on an `isometric` floor, on canvas: the sides facing the viewer,
 * then the top.  Part of the `isometric` view, so flat charts don't bundle it.
 */
export function renderBoxFaces(
  ctx: CanvasRenderingContext2D,
  faces: BoxFace[],
  styleOpts: ComputedStylesOptions,
  styleOverrides: ComputedStylesOptions | undefined
) {
  for (const face of faces) {
    const pathData = polygonPath(face.points);
    renderPathData(ctx, pathData, styleOpts);
    // Darkened by an overlay, as Safari's canvas ignores `filter`.  Not on the hit canvas
    if (face.shade && !styleOverrides) {
      renderPathData(ctx, pathData, { styles: { fill: 'black', fillOpacity: face.shade } });
    }
  }
}
