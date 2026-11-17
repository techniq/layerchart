import type { IsometricView } from './isometric.base.js';
import type { OrthographicView, PerspectiveView } from './camera.js';

/**
 * How a chart's plot is seen.  Without one, it's drawn flat.  `isometric` stands it up in any
 * layer; `perspective` and `orthographic` only in a 3D layer.
 */
export type ChartView = IsometricView | PerspectiveView | OrthographicView;

/** A `view`, or a view function to call with its defaults (ex. `view={isometric}`) */
export type ChartViewProp = ChartView | (() => ChartView);

/** The view a `view` prop names, calling a view function for its defaults */
export function resolveView(view: ChartViewProp | null | undefined): ChartView | null {
  if (view == null) return null;
  return typeof view === 'function' ? view() : view;
}

let warned = false;

/**
 * A mark with height in a `layer` its `isometric` has no renderer for — ex. `isometric` from
 * `layerchart/svg` with a canvas `Layer` — draws flat, with a warning the first time
 */
export function missingRenderer(layer: 'svg' | 'canvas' | 'html') {
  if (warned) return;
  warned = true;
  console.warn(
    `LayerChart: this chart's \`isometric\` can't draw height in a ${layer} layer, so it lies flat. ` +
      `Import \`isometric\` from 'layerchart' or 'layerchart/${layer}'.`
  );
}

let warnedFlat = false;

/** Whether a flat layer (svg, canvas, html) can draw under `view` */
export function drawsFlatLayers(view: ChartView | null) {
  return view == null || view.type === 'isometric';
}

/**
 * A flat layer under a 3D view (`perspective`, `orthographic`) draws as if there were no view,
 * with a warning the first time.  `ignoreTransform` layers (ex. a title over the scene) are fine.
 */
export function warnFlatLayer(layer: 'svg' | 'canvas' | 'html', view: ChartView) {
  if (warnedFlat) return;
  warnedFlat = true;
  console.warn(
    `LayerChart: a ${layer} layer can't draw through a \`${view.type}\` view, so it's drawn flat. ` +
      `Use a 3D layer (\`WebGL\` from '@layerchart/webgl'), or set \`ignoreTransform\` on the layer ` +
      `to draw it over the scene.`
  );
}
