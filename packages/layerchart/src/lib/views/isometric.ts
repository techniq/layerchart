import {
  autoIsometricAspect,
  backWalls,
  boxFaces,
  createIsometricMatrix,
  extrudePath,
  fitIsometricFloor,
  floorCorner,
  isometricLift,
  paintOrder,
  planeCircle,
  screenToFloor,
  sectorDepth,
  viewportAnchors,
  type IsometricOptions,
} from '$lib/utils/isometric.js';
import {
  highlightShadows,
  highlightWallLines,
} from '$lib/components/Highlight/Highlight.isometric.js';
import HighlightShadows from '$lib/components/Highlight/HighlightShadows.svelte';
import GridWalls from '$lib/components/Grid/GridWalls.svelte';
import PathExtruded from '$lib/components/Path/PathExtruded.svg.svelte';
import RectBoxSvg from '$lib/components/Rect/RectBox.svg.svelte';
import RectBoxHtml from '$lib/components/Rect/RectBox.html.svelte';
import { renderBoxFaces } from '$lib/components/Rect/RectBox.canvas.js';

/**
 * What an isometric chart draws with, beyond a flat one: the floor's fit and matrix, and the
 * geometry and components of marks with height.  Reached through the chart (`ctx.isometric`)
 * rather than imported by the marks, so charts that never use `isometric` don't bundle it.
 */
const impl = {
  autoIsometricAspect,
  backWalls,
  boxFaces,
  createIsometricMatrix,
  extrudePath,
  fitIsometricFloor,
  floorCorner,
  isometricLift,
  paintOrder,
  planeCircle,
  screenToFloor,
  sectorDepth,
  viewportAnchors,
  highlightShadows,
  highlightWallLines,
  // Components and drawing of marks with height, by layer
  GridWalls,
  HighlightShadows,
  PathExtruded,
  RectBoxHtml,
  RectBoxSvg,
  renderBoxFaces,
};

export type IsometricImpl = typeof impl;

export type IsometricView = {
  type: 'isometric';
  options: IsometricOptions;
  impl: IsometricImpl;
};

/**
 * Draw the chart's plot area as a floor seen at an angle, for a `Chart`'s `view`:
 * `view={isometric}` for true isometric, or `view={isometric({ rotate: -30, tilt: 60 })}`.
 */
export function isometric(options: IsometricOptions = {}): IsometricView {
  return { type: 'isometric', options, impl };
}
