import { renderBoxFaces } from '$lib/components/Rect/RectBox.canvas.js';
import { createIsometric } from './isometric.base.js';

/** `isometric` drawing height in canvas layers only (see `layerchart`'s) */
export const isometric = /* @__PURE__ */ createIsometric({ renderBoxFaces });
