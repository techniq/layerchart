import type { IsometricView } from './isometric.base.js';

/** How a chart's plot is seen.  Without one, it's drawn flat. */
export type ChartView = IsometricView;

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
