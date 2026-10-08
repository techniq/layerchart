import PathExtruded from '$lib/components/Path/PathExtruded.svg.svelte';
import RectBoxSvg from '$lib/components/Rect/RectBox.svg.svelte';
import { createIsometric } from './isometric.base.js';

/** `isometric` drawing height in svg layers only (see `layerchart`'s) */
export const isometric = /* @__PURE__ */ createIsometric({ PathExtruded, RectBoxSvg });
