import RectBoxHtml from '$lib/components/Rect/RectBox.html.svelte';
import { createIsometric } from './isometric.base.js';

/** `isometric` drawing height in html layers only (see `layerchart`'s) */
export const isometric = /* @__PURE__ */ createIsometric({ RectBoxHtml });
