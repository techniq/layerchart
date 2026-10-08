import PathExtruded from '$lib/components/Path/PathExtruded.svg.svelte';
import RectBoxSvg from '$lib/components/Rect/RectBox.svg.svelte';
import RectBoxHtml from '$lib/components/Rect/RectBox.html.svelte';
import { renderBoxFaces } from '$lib/components/Rect/RectBox.canvas.js';
import { createIsometric } from './isometric.base.js';

/**
 * Draw the chart's plot area as a floor seen at an angle, for a `Chart`'s `view`:
 * `view={isometric}` for true isometric, or `view={isometric({ rotate: -30, tilt: 60 })}`.  Draws
 * height in every layer; `layerchart/svg` (`/canvas`, `/html`) exports one for just that layer.
 */
export const isometric = /* @__PURE__ */ createIsometric({
  PathExtruded,
  RectBoxSvg,
  RectBoxHtml,
  renderBoxFaces,
});
