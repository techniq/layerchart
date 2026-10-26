import type { Component } from 'svelte';
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
import type { renderBoxFaces } from '$lib/components/Rect/RectBox.canvas.js';

/**
 * What an isometric chart draws with in any layer: the floor's fit and matrix, and the geometry
 * of marks with height.
 */
const geometry = {
  autoIsometricAspect,
  backWalls,
  boxFaces,
  createIsometricMatrix,
  extrudePath,
  fitIsometricFloor,
  floorCorner,
  highlightShadows,
  highlightWallLines,
  isometricLift,
  paintOrder,
  planeCircle,
  screenToFloor,
  sectorDepth,
  viewportAnchors,
  GridWalls,
  HighlightShadows,
};

/**
 * What draws marks with height in each layer.  `layerchart` carries all of them, and
 * `layerchart/svg` (`/canvas`, `/html`) only its own, so a chart doesn't bundle the others.
 */
export type IsometricRenderers = {
  /** svg: a `Path` stood up by `z` */
  PathExtruded?: Component<any>;
  /** svg: a `Rect` stood up into a box */
  RectBoxSvg?: Component<any>;
  /** html: a `Rect` stood up into a box */
  RectBoxHtml?: Component<any>;
  /** canvas: a `Rect` stood up into a box */
  renderBoxFaces?: typeof renderBoxFaces;
};

/**
 * What an isometric chart draws with, beyond a flat one.  Reached through the chart
 * (`ctx.isometric`) rather than imported by the marks, so charts that never use `isometric` don't
 * bundle it.
 */
export type IsometricImpl = typeof geometry & IsometricRenderers;

export type IsometricView = {
  type: 'isometric';
  options: IsometricOptions;
  impl: IsometricImpl;
};

/** The `isometric` view function, drawing marks with height with `renderers` */
export function createIsometric(renderers: IsometricRenderers) {
  const impl: IsometricImpl = { ...geometry, ...renderers };
  /**
   * Draw the chart's plot area as a floor seen at an angle, for a `Chart`'s `view`:
   * `view={isometric}` for true isometric, or `view={isometric({ rotate: -30, tilt: 60 })}`.
   */
  return function isometric(options: IsometricOptions = {}): IsometricView {
    return { type: 'isometric', options, impl };
  };
}
